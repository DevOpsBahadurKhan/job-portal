
const crypto = require("crypto");
const prisma = require("../prisma");
const razorpay = require("../config/razorpay");

/**
 * Create Razorpay order for a pending subscription.
 */
const createPaymentOrder = async ({ userId, subscriptionId }) => {
    const subscription = await prisma.subscription.findFirst({
        where: {
            id: Number(subscriptionId),
            userId: Number(userId),
            status: "PENDING",
        },
        include: {
            plan: true,
        },
    });

    if (!subscription) {
        throw new Error("Pending subscription not found");
    }

    const plan = subscription.plan;

    if (!plan || !plan.isActive) {
        throw new Error("Plan is not available");
    }

    if (plan.price <= 0) {
        throw new Error("Free plans do not require payment");
    }

    const order = await razorpay.orders.create({
        amount: plan.price,
        currency: plan.currency,
        receipt: `sub_${subscription.id}_${Date.now()}`,
        notes: {
            userId: String(userId),
            subscriptionId: String(subscription.id),
            planId: String(plan.id),
        },
    });

    const payment = await prisma.payment.create({
        data: {
            recruiterId: Number(userId),
            subscriptionId: subscription.id,
            amount: plan.price,
            currency: plan.currency,
            status: "PENDING",
            razorpayOrderId: order.id,
        },
    });

    return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
    };
};


/**
 * Shared idempotent payment activation logic.
 *
 * Call only after trusted Razorpay confirmation:
 * - Checkout: signature and captured payment verified.
 * - Webhook: raw-body webhook signature verified.
 */
const processCapturedPayment = async ({
    orderId,
    paymentId,
    amount,
    currency,
}) => {
    if (!orderId || !paymentId || amount == null || !currency) {
        throw new Error("Incomplete captured payment details");
    }

    const payment = await prisma.payment.findFirst({
        where: {
            razorpayOrderId: orderId,
        },
        include: {
            subscription: {
                include: {
                    plan: true,
                },
            },
        },
    });

    if (!payment || !payment.subscription || !payment.subscription.plan) {
        throw new Error("Payment or subscription not found");
    }

    if (
        payment.amount !== amount ||
        payment.currency !== currency
    ) {
        throw new Error("Payment amount or currency mismatch");
    }

    return prisma.$transaction(async (tx) => {
        const latestPayment = await tx.payment.findUnique({
            where: {
                id: payment.id,
            },
        });

        const subscription = await tx.subscription.findUnique({
            where: {
                id: payment.subscriptionId,
            },
        });

        if (!latestPayment || !subscription) {
            throw new Error("Payment or subscription not found");
        }

        // Idempotency: safely handle an already-processed payment.
        if (latestPayment.status === "PAID") {
            if (latestPayment.razorpayPaymentId !== paymentId) {
                throw new Error(
                    "Payment already processed with another payment ID"
                );
            }

            if (subscription.status === "ACTIVE") {
                return {
                    alreadyProcessed: true,
                };
            }

            throw new Error(
                "Payment succeeded but subscription activation needs reconciliation"
            );
        }

        if (latestPayment.status !== "PENDING") {
            throw new Error("Payment is no longer pending");
        }

        if (subscription.status !== "PENDING") {
            throw new Error("Subscription is no longer pending");
        }

        const now = new Date();
        const periodEnd = new Date(now);

        const interval =
            payment.subscription.plan.billingInterval?.toUpperCase();

        if (interval === "YEARLY" || interval === "ANNUAL") {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Update payment status using the valid Prisma enum value.
        const paymentUpdate = await tx.payment.updateMany({
            where: {
                id: latestPayment.id,
                status: "PENDING",
            },
            data: {
                status: "PAID",
                razorpayPaymentId: paymentId,
            },
        });

        if (paymentUpdate.count !== 1) {
            throw new Error("Payment processing conflict; retry safely");
        }

        // Activate the subscription in the same transaction.
        const subscriptionUpdate = await tx.subscription.updateMany({
            where: {
                id: subscription.id,
                status: "PENDING",
            },
            data: {
                status: "ACTIVE",
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
        });

        if (subscriptionUpdate.count !== 1) {
            throw new Error("Subscription activation conflict");
        }

        return {
            alreadyProcessed: false,
        };
    });
};


/**
 * Verify payment from Razorpay Checkout.
 */
const verifyPayment = async ({
    userId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
    ) {
        throw new Error("Missing Razorpay payment details");
    }

    if (
        !process.env.RAZORPAY_KEY_SECRET ||
        !process.env.RAZORPAY_KEY_ID
    ) {
        throw new Error("Razorpay configuration is missing");
    }

    // Find the order belonging to this user.
    const payment = await prisma.payment.findFirst({
        where: {
            razorpayOrderId: razorpay_order_id,
            recruiterId: Number(userId),
        },
    });

    if (!payment) {
        throw new Error("Payment not found for this user");
    }

    // Verify Razorpay Checkout signature.
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (!/^[a-fA-F0-9]{64}$/.test(razorpay_signature)) {
        throw new Error("Invalid Razorpay payment signature");
    }

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
        received.length !== expected.length ||
        !crypto.timingSafeEqual(received, expected)
    ) {
        throw new Error("Invalid Razorpay payment signature");
    }

    // Fetch payment status directly from Razorpay.
    const rpPayment = await razorpay.payments.fetch(
        razorpay_payment_id
    );

    if (
        rpPayment.order_id !== razorpay_order_id ||
        rpPayment.status !== "captured" ||
        rpPayment.amount !== payment.amount ||
        rpPayment.currency !== payment.currency
    ) {
        throw new Error(
            "Payment is not captured or payment details mismatch"
        );
    }

    // Both Checkout verification and webhook use the same processor.
    return processCapturedPayment({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: rpPayment.amount,
        currency: rpPayment.currency,
    });
};


module.exports = {
    createPaymentOrder,
    verifyPayment,
    processCapturedPayment,
};
