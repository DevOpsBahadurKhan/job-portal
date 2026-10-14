
const {
    validateCareerAssessment,
} = require("./careerGuidance.validation");

const {
    getCareerGuidanceContext,
    generateCareerRecommendations,
} = require("./careerGuidance.service");

const usageService = require("../usage/usage.service");

async function generateCareerGuidance(req, res, next) {
    let reservation;
    const userId = Number(req.user?.id);

    try {
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        const validation = validateCareerAssessment(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid career assessment.",
                errors: validation.errors,
            });
        }

        // 1. Fetch candidate context before reserving quota.
        const context = await getCareerGuidanceContext(userId);

        // 2. Reserve Career Guidance quota before AI generation.
        reservation = await usageService.reserveUsage(
            userId,
            "CAREER_GUIDANCE"
        );

        // 3. Generate personalized recommendations using Gemini.
        const recommendations = await generateCareerRecommendations(
            context,
            validation.data
        );

        // 4. Return recommendations and updated usage.
        return res.status(200).json({
            success: true,
            message: "Career guidance generated successfully.",
            data: {
                assessment: validation.data,
                recommendations,
            },
            usage: {
                feature: reservation.feature,
                used: reservation.used,
                limit: reservation.limit,
                remaining: reservation.remaining,
            },
        });
    } catch (error) {
        // Release the reservation if processing fails.
        if (reservation) {
            try {
                await usageService.releaseUsage(
                    userId,
                    reservation.feature,
                    reservation.periodStart
                );
            } catch (releaseError) {
                console.error(
                    "Failed to release Career Guidance usage:",
                    releaseError
                );
            }
        }

        if (error.code === "USAGE_LIMIT_EXCEEDED") {
            return res.status(429).json({
                success: false,
                code: error.code,
                message:
                    "Monthly Career Guidance limit reached. Upgrade your plan to continue.",
                data: error.details,
            });
        }

        return next(error);
    }
}

module.exports = {
    generateCareerGuidance,
};
