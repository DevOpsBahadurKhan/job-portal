
const prisma = require("../prisma");

const getMySubscription = async (userId) => {
    const now = new Date();

    const periodStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const periodEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "ACTIVE",
            currentPeriodStart: { lte: now },
            currentPeriodEnd: { gt: now },
        },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
    });

    const plan =
        subscription?.plan ??
        (await prisma.plan.findFirst({
            where: {
                name: "FREE",
                isActive: true,
                targetAudience: { in: ["BOTH", "CANDIDATE"] },
            },
        }));

    if (!plan) {
        throw new Error("No active subscription or eligible FREE plan found");
    }

    const features = [
        { key: "aiAssistant", feature: "AI_ASSISTANT", limit: plan.maxAiMessages },
        { key: "resumeAnalysis", feature: "RESUME_ANALYSIS", limit: plan.maxResumeAnalyses },
        { key: "skillGapAnalysis", feature: "SKILL_GAP_ANALYSIS", limit: plan.maxSkillGapAnalyses },
        { key: "careerGuidance", feature: "CAREER_GUIDANCE", limit: plan.maxCareerGuidance },
    ];

    const records = await prisma.usageRecord.findMany({
        where: {
            userId,
            periodStart,
            feature: { in: features.map((item) => item.feature) },
        },
    });

    const usage = Object.fromEntries(
        features.map((item) => {
            const record = records.find(
                (entry) => entry.feature === item.feature
            );

            const used = record?.usageCount ?? 0;

            return [
                item.key,
                {
                    used,
                    limit: item.limit,
                    remaining: Math.max(0, item.limit - used),
                },
            ];
        })
    );

    return {
        plan: {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            billingInterval: plan.billingInterval,
            targetAudience: plan.targetAudience,
            maxActiveJobs: plan.maxActiveJobs,
        },
        subscription: subscription
            ? {
                id: subscription.id,
                status: subscription.status,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
            : null,
        usage,
        usagePeriod: {
            start: periodStart,
            end: periodEnd,
        },
    };
};

const subscribeToPlan = async ({ userId, planId }) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    if (!["CANDIDATE", "RECRUITER"].includes(user.role)) {
        const error = new Error("Your role cannot subscribe to plans");
        error.statusCode = 403;
        throw error;
    }

    const plan = await prisma.plan.findFirst({
        where: {
            id: planId,
            isActive: true,
            targetAudience: { in: [user.role, "BOTH"] },
        },
    });

    if (!plan) {
        const error = new Error(
            "Plan not found, inactive, or unavailable for your role"
        );
        error.statusCode = 404;
        throw error;
    }

    const now = new Date();

    const activeSubscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "ACTIVE",
            currentPeriodStart: { lte: now },
            currentPeriodEnd: { gt: now },
        },
        orderBy: { createdAt: "desc" },
    });

    const isFreePlan = plan.price === 0 || plan.name.toUpperCase() === "FREE";

    if (activeSubscription && activeSubscription.planId === plan.id) {
        const error = new Error("You are already subscribed to this plan");
        error.statusCode = 409;
        throw error;
    }

    if (activeSubscription && isFreePlan) {
        const error = new Error(
            "You already have an active subscription. Manage your current plan before switching to Free."
        );
        error.statusCode = 409;
        throw error;
    }

    

    const pendingSubscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "PENDING",
        },
        include: {
            plan: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (pendingSubscription) {
        // Same plan: resume checkout using the existing subscription.
        if (pendingSubscription.planId === plan.id) {
            return {
                subscription: pendingSubscription,
                requiresPayment: true,
                message:
                    "Existing pending subscription found. Continue payment.",
            };
        }

        // Different plan: don't silently reuse the wrong subscription.
        const error = new Error(
            `You already have a pending ${pendingSubscription.plan.name} subscription. Complete or cancel it before selecting another plan.`
        );

        error.statusCode = 409;
        throw error;
    }


    if (pendingSubscription) {
        const error = new Error(
            "You already have a pending subscription. Complete or cancel it first."
        );
        error.statusCode = 409;
        throw error;
    }

    // Free plans can activate immediately.
    // Paid plans remain PENDING until payment is verified.
    const status = isFreePlan ? "ACTIVE" : "PENDING";

    let currentPeriodStart = null;
    let currentPeriodEnd = null;

    if (isFreePlan) {
        currentPeriodStart = now;
        currentPeriodEnd = new Date(now);

        const interval = plan.billingInterval.toUpperCase();

        if (interval === "YEARLY" || interval === "ANNUAL") {
            currentPeriodEnd.setFullYear(
                currentPeriodEnd.getFullYear() + 1
            );
        } else {
            currentPeriodEnd.setMonth(
                currentPeriodEnd.getMonth() + 1
            );
        }
    }

    const subscription = await prisma.subscription.create({
        data: {
            userId,
            // The current schema requires recruiterId for every subscription.
            // This field should ideally be made optional or redesigned later.
            recruiterId: userId,
            planId: plan.id,
            status,
            currentPeriodStart,
            currentPeriodEnd,
        },
        include: {
            plan: true,
        },
    });

    return {
        subscription,
        requiresPayment: !isFreePlan,
        message: isFreePlan
            ? "Free plan activated successfully"
            : "Subscription created. Payment is required before activation.",
    };
};

const cancelMySubscription = async (userId, subscriptionId) => {
    const subscription = await prisma.subscription.findFirst({
        where: {
            id: subscriptionId,
            userId,
        },
        include: {
            plan: true,
        },
    });

    if (!subscription) {
        const error = new Error("Subscription not found.");
        error.statusCode = 404;
        throw error;
    }

    if (subscription.status === "CANCELLED") {
        const error = new Error("Subscription is already cancelled.");
        error.statusCode = 409;
        throw error;
    }

    // Pending subscriptions can be cancelled locally only
    // when no payment-provider subscription has been created.
    if (subscription.status === "PENDING") {
        if (subscription.razorpaySubscriptionId) {
            const error = new Error(
                "This subscription requires provider-side cancellation."
            );
            error.statusCode = 409;
            throw error;
        }

        return prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "CANCELLED" },
            select: {
                id: true,
                status: true,
                plan: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                cancelAtPeriodEnd: true,
                currentPeriodEnd: true,
            },
        });
    }

    if (subscription.status !== "ACTIVE") {
        const error = new Error(
            "Only pending or active subscriptions can be cancelled."
        );
        error.statusCode = 409;
        throw error;
    }

    // Free plan is the default access tier; don't cancel it.
    if (subscription.plan.price === 0) {
        const error = new Error(
            "The Free plan cannot be cancelled."
        );
        error.statusCode = 400;
        throw error;
    }

    // Paid plan: retain access until the current period ends.
    if (subscription.cancelAtPeriodEnd) {
        return subscription;
    }

    return prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            cancelAtPeriodEnd: true,
        },
        select: {
            id: true,
            status: true,
            plan: {
                select: {
                    id: true,
                    name: true,
                },
            },
            cancelAtPeriodEnd: true,
            currentPeriodEnd: true,
        },
    });
};


module.exports = {
    getMySubscription,
    subscribeToPlan,
    cancelMySubscription
};
