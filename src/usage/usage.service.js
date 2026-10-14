const prisma = require("../prisma");

const getCurrentPeriod = () => {
    const now = new Date();

    const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );

    const end = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    return { start, end };
};

const getPlanForUser = async (userId) => {
    const now = new Date();

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "ACTIVE",
            AND: [
                {
                    OR: [
                        { currentPeriodStart: null },
                        { currentPeriodStart: { lte: now } },
                    ],
                },
                {
                    OR: [
                        { currentPeriodEnd: null },
                        { currentPeriodEnd: { gt: now } },
                    ],
                },
            ],
        },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
    });

    if (subscription?.plan?.isActive) {
        return subscription.plan;
    }

    const freePlan = await prisma.plan.findFirst({
        where: {
            name: "FREE",
            isActive: true,
        },
    });

    if (!freePlan) {
        throw new Error("Active FREE plan is not configured");
    }

    return freePlan;
};

const FEATURE_LIMITS = {
    AI_ASSISTANT: "maxAiMessages",
    RESUME_ANALYSIS: "maxResumeAnalyses",
    SKILL_GAP_ANALYSIS: "maxSkillGapAnalyses",
    CAREER_GUIDANCE: "maxCareerGuidance",
};

const reserveUsage = async (userId, feature) => {
    const limitField = FEATURE_LIMITS[feature];

    if (!limitField) {
        throw new Error(`Unsupported usage feature: ${feature}`);
    }

    const plan = await getPlanForUser(userId);
    const limit = plan[limitField];

    const { start, end } = getCurrentPeriod();
    const now = new Date();

    // Atomically create a usage row or increment it only if below limit.
    const rows = await prisma.$queryRaw`
    INSERT INTO "UsageRecord"
      ("userId", "feature", "periodStart", "periodEnd",
       "usageCount", "createdAt", "updatedAt")
    SELECT
      ${userId},
      ${feature}::"UsageFeature",
      ${start},
      ${end},
      1,
      ${now},
      ${now}
    WHERE ${limit} > 0
    ON CONFLICT ("userId", "feature", "periodStart")
    DO UPDATE SET
      "usageCount" = "UsageRecord"."usageCount" + 1,
      "updatedAt" = EXCLUDED."updatedAt"
    WHERE "UsageRecord"."usageCount" < ${limit}
    RETURNING "usageCount"
  `;

    if (rows.length === 0) {
        const error = new Error("Monthly usage limit reached");
        error.code = "USAGE_LIMIT_EXCEEDED";
        error.details = {
            feature,
            limit,
            periodStart: start,
            periodEnd: end,
        };
        throw error;
    }

    return {
        feature,
        limit,
        used: rows[0].usageCount,
        remaining: Math.max(0, limit - rows[0].usageCount),
        periodStart: start,
        periodEnd: end,
    };
};

const releaseUsage = async (userId, feature, periodStart) => {
    await prisma.usageRecord.updateMany({
        where: {
            userId,
            feature,
            periodStart,
            usageCount: { gt: 0 },
        },
        data: {
            usageCount: { decrement: 1 },
        },
    });
};

module.exports = {
    reserveUsage,
    releaseUsage,
};