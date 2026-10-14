const ALLOWED_WORK_STYLES = [
    "REMOTE",
    "HYBRID",
    "ONSITE",
    "ANY",
];

function validateCareerAssessment(body) {
    const errors = [];

    const careerGoal =
        typeof body?.careerGoal === "string"
            ? body.careerGoal.trim()
            : "";

    const interests = body?.interests;

    const preferredWorkStyle =
        body?.preferredWorkStyle ?? "ANY";

    if (!careerGoal) {
        errors.push("Career goal is required.");
    } else if (careerGoal.length > 500) {
        errors.push("Career goal must not exceed 500 characters.");
    }

    if (
        !Array.isArray(interests) ||
        interests.length === 0
    ) {
        errors.push("Please provide at least one career interest.");
    } else if (interests.length > 10) {
        errors.push("You can select a maximum of 10 interests.");
    } else if (
        interests.some(
            (item) =>
                typeof item !== "string" ||
                !item.trim() ||
                item.trim().length > 100
        )
    ) {
        errors.push(
            "Each interest must be a non-empty string of at most 100 characters."
        );
    }

    if (
        typeof preferredWorkStyle !== "string" ||
        !ALLOWED_WORK_STYLES.includes(
            preferredWorkStyle.toUpperCase()
        )
    ) {
        errors.push(
            "Work style must be REMOTE, HYBRID, ONSITE, or ANY."
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
        data: {
            careerGoal,
            interests: Array.isArray(interests)
                ? [
                    ...new Set(
                        interests.map((item) =>
                            typeof item === "string"
                                ? item.trim()
                                : item
                        )
                    ),
                ]
                : [],
            preferredWorkStyle:
                typeof preferredWorkStyle === "string"
                    ? preferredWorkStyle.toUpperCase()
                    : "ANY",
        },
    };
}

module.exports = {
    validateCareerAssessment,
};