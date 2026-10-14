const prisma = require("../prisma");

const getActivePlans = async (targetAudience) => {
    const where = {
        isActive: true,
    };

    if (targetAudience) {
        where.targetAudience = {
            in: [targetAudience, "BOTH"],
        };
    }

    return prisma.plan.findMany({
        where,
        orderBy: {
            price: "asc",
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            billingInterval: true,
            targetAudience: true,
            maxActiveJobs: true,
            maxAiMessages: true,
            maxResumeAnalyses: true,
            maxSkillGapAnalyses: true,
            maxCareerGuidance: true,
        },
    });
};

module.exports = { getActivePlans };

module.exports = {
    getActivePlans,
};