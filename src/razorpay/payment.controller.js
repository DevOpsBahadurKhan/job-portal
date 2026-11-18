const paymentService = require("./razorpay-plan.service");

const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                message: "subscriptionId is required",
            });
        }

        const data = await paymentService.createPaymentOrder({
            userId,
            subscriptionId,
        });

        return res.status(201).json({
            success: true,
            message: "Razorpay order created successfully",
            data,
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Unable to create payment order",
        });
    }
};


const verifyPaymentController = async (req, res) => {
    try {
        const result = await paymentService.verifyPayment({
            userId: req.user.id,
            razorpay_order_id: req.body.razorpay_order_id,
            razorpay_payment_id: req.body.razorpay_payment_id,
            razorpay_signature: req.body.razorpay_signature,
        });

        return res.status(200).json({
            success: true,
            message: result.alreadyProcessed
                ? "Payment already verified"
                : "Payment verified and subscription activated",
        });
    } catch (error) {
        console.error("Payment verification error:", error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret || !Buffer.isBuffer(req.body)) {
            return res.status(400).send("Invalid webhook configuration");
        }

        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).send("Missing webhook signature");
        }

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(req.body)
            .digest("hex");

        const received = Buffer.from(String(signature), "hex");
        const expected = Buffer.from(expectedSignature, "hex");

        if (
            received.length !== expected.length ||
            !crypto.timingSafeEqual(received, expected)
        ) {
            return res.status(400).send("Invalid webhook signature");
        }

        const event = JSON.parse(req.body.toString("utf8"));

        if (event.event === "payment.captured") {
            const payment = event.payload?.payment?.entity;

            if (
                !payment?.id ||
                !payment?.order_id ||
                payment.status !== "captured"
            ) {
                return res.status(400).send("Invalid captured payment event");
            }

            await paymentService.processCapturedPayment({
                orderId: payment.order_id,
                paymentId: payment.id,
                amount: payment.amount,
                currency: payment.currency,
            });
        }

        // Other events are acknowledged but do not activate subscriptions.
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Razorpay webhook error:", error);

        // A non-2xx response allows the provider to retry delivery.
        return res.status(500).send("Webhook processing failed");
    }
};

module.exports = {
    createOrder,
    verifyPaymentController,
    razorpayWebhook
};