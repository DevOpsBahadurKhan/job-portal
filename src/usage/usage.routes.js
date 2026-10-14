const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const passport = require("../passport");
const authenticate = passport.authenticate("jwt", {
    session: false,
});




router.get("/me", authenticate, async (req, res, next) => {
    try {
        const userId = Number(req.user?.id);

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const now = new Date();

        const start = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
        );

        const end = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
        );

        // Find the user's active plan, or fall back to FREE.
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

        let plan = subscription?.plan?.isActive
            ? subscription.plan
            : null;

        if (!plan) {
            plan = await prisma.plan.findFirst({
                where: { name: "FREE", isActive: true },
            });
        }

        if (!plan) {
            return res.status(500).json({
                success: false,
                message: "Active FREE plan is not configured",
            });
        }

        const records = await prisma.usageRecord.findMany({
            where: {
                userId,
                periodStart: start,
            },
            select: {
                feature: true,
                usageCount: true,
            },
        });

        const usedByFeature = Object.fromEntries(
            records.map((record) => [
                record.feature,
                record.usageCount,
            ])
        );

        const usage = {
            aiAssistant: {
                used: usedByFeature.AI_ASSISTANT ?? 0,
                limit: plan.maxAiMessages,
                remaining: Math.max(
                    0,
                    plan.maxAiMessages - (usedByFeature.AI_ASSISTANT ?? 0)
                ),
            },
            resumeAnalysis: {
                used: usedByFeature.RESUME_ANALYSIS ?? 0,
                limit: plan.maxResumeAnalyses,
                remaining: Math.max(
                    0,
                    plan.maxResumeAnalyses -
                    (usedByFeature.RESUME_ANALYSIS ?? 0)
                ),
            },
            skillGapAnalysis: {
                used: usedByFeature.SKILL_GAP_ANALYSIS ?? 0,
                limit: plan.maxSkillGapAnalyses,
                remaining: Math.max(
                    0,
                    plan.maxSkillGapAnalyses -
                    (usedByFeature.SKILL_GAP_ANALYSIS ?? 0)
                ),
            },
            careerGuidance: {
                used: usedByFeature.CAREER_GUIDANCE ?? 0,
                limit: plan.maxCareerGuidance,
                remaining: Math.max(
                    0,
                    plan.maxCareerGuidance -
                    (usedByFeature.CAREER_GUIDANCE ?? 0)
                ),
            },
        };

        return res.status(200).json({
            success: true,
            data: {
                plan: {
                    id: plan.id,
                    name: plan.name,
                },
                usage,
                usagePeriod: {
                    start,
                    end,
                },
            },
        });
    } catch (error) {
        next(error);
    }
});


module.exports = router;
