const prisma = require("../prisma");

const getMySubscription = async (userId) => {
    const now = new Date();

    const periodStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const periodEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    // Find the user's active SaaS subscription.
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "ACTIVE",
            currentPeriodStart: { lte: now },
            currentPeriodEnd: { gt: now },
        },
        include: {
            plan: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Fallback to the active FREE plan.
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
            feature: {
                in: features.map((item) => item.feature),
            },
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

module.exports = {
    getMySubscription,
};