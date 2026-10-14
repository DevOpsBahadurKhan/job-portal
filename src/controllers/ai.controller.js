const { runAI } = require("../ai/orchestrator/aiOrchestrator");

const prisma = require("../prisma");
const usageService = require("../usage/usage.service");

const chatWithAI = async (req, res, next) => {
    let reservation;
    const userId = Number(req.user?.id);

    try {
        const { message } = req.body ?? {};

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Reserve quota before making the AI call.
        reservation = await usageService.reserveUsage(
            userId,
            "AI_ASSISTANT"
        );

        const profile = await prisma.candidateProfile.findUnique({
            where: { userId },
        });

        const result = await runAI({
            message: message.trim(),
            userId,
            profile,
        });

        return res.status(200).json({
            success: true,
            data: result,
            usage: {
                used: reservation.used,
                limit: reservation.limit,
                remaining: reservation.remaining,
            },
        });
    } catch (error) {
        // If processing fails, release the reservation.
        if (reservation) {
            try {
                await usageService.releaseUsage(
                    userId,
                    reservation.feature,
                    reservation.periodStart
                );
            } catch (releaseError) {
                console.error("Failed to release AI usage:", releaseError);
            }
        }

        if (error.code === "USAGE_LIMIT_EXCEEDED") {
            return res.status(429).json({
                success: false,
                code: error.code,
                message: "Monthly AI Assistant limit reached. Upgrade your plan to continue.",
                data: error.details,
            });
        }

        return next(error);
    }
};

module.exports = { chatWithAI };