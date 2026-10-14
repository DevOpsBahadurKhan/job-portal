
const {
    getSkillGapBaseData,
    generateLearningRoadmap,
} = require("./skillGap.service");

const usageService = require("../usage/usage.service");

const getSkillGapController = async (req, res, next) => {
    let reservation;
    const userId = Number(req.user?.id);

    try {
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found",
            });
        }

        const { jobId } = req.query;

        // Validate profile, resume, analysis and job first.
        const baseData = await getSkillGapBaseData({
            userId,
            jobId,
        });

        // No missing skills means no AI roadmap request is needed.
        if (baseData.missingSkills.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    ...baseData,
                    learningRoadmap: [],
                },
                usage: null,
            });
        }

        // Reserve quota immediately before AI processing.
        reservation = await usageService.reserveUsage(
            userId,
            "SKILL_GAP_ANALYSIS"
        );

        const learningRoadmap = await generateLearningRoadmap({
            missingSkills: baseData.missingSkills,
            targetJobTitle:
                baseData.targetJob?.title ?? "General career development",
        });

        return res.status(200).json({
            success: true,
            data: {
                ...baseData,
                learningRoadmap,
            },
            usage: {
                feature: reservation.feature,
                used: reservation.used,
                limit: reservation.limit,
                remaining: reservation.remaining,
            },
        });
    } catch (error) {
        if (reservation) {
            try {
                await usageService.releaseUsage(
                    userId,
                    reservation.feature,
                    reservation.periodStart
                );
            } catch (releaseError) {
                console.error(
                    "Failed to release Skill Gap usage:",
                    releaseError
                );
            }
        }

        if (error.code === "USAGE_LIMIT_EXCEEDED") {
            return res.status(429).json({
                success: false,
                code: error.code,
                message:
                    "Monthly Skill Gap Analysis limit reached. Upgrade your plan to continue.",
                data: error.details,
            });
        }

        if (
            error.message === "Candidate profile not found" ||
            error.message === "Please set a default resume first" ||
            error.message === "Your default resume is not processed yet" ||
            error.message === "Resume analysis not found" ||
            error.message === "Job not found"
        ) {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        if (error.message === "Invalid jobId") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        return next(error);
    }
};

module.exports = {
    getSkillGapController,
};
