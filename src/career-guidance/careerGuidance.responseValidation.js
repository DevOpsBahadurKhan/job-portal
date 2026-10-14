const isNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0;

function validateCareerRecommendations(data) {
    const errors = [];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return {
            isValid: false,
            errors: ["Response must be a JSON object."],
        };
    }

    const requiredStrings = [
        "careerPath",
        "currentLevel",
        "targetRole",
        "summary",
    ];

    for (const field of requiredStrings) {
        if (!isNonEmptyString(data[field])) {
            errors.push(`${field} must be a non-empty string.`);
        }
    }

    if (
        !data.profileMismatch ||
        typeof data.profileMismatch.detected !== "boolean" ||
        !Array.isArray(data.profileMismatch.details) ||
        !data.profileMismatch.details.every(isNonEmptyString)
    ) {
        errors.push("profileMismatch has an invalid structure.");
    }

    if (!Array.isArray(data.skillGaps)) {
        errors.push("skillGaps must be an array.");
    } else {
        data.skillGaps.forEach((item, index) => {
            if (
                !item ||
                !isNonEmptyString(item.skill) ||
                !["HIGH", "MEDIUM", "LOW"].includes(item.priority) ||
                !isNonEmptyString(item.reason) ||
                !isNonEmptyString(item.learningAction)
            ) {
                errors.push(`skillGaps[${index}] is invalid.`);
            }
        });
    }

    if (!Array.isArray(data.roadmap) || data.roadmap.length === 0) {
        errors.push("roadmap must contain at least one phase.");
    } else {
        data.roadmap.forEach((phase, index) => {
            if (
                !phase ||
                !isNonEmptyString(phase.phase) ||
                !isNonEmptyString(phase.duration) ||
                !isNonEmptyString(phase.focus) ||
                !Array.isArray(phase.tasks) ||
                !phase.tasks.every(isNonEmptyString) ||
                !Array.isArray(phase.completionCriteria) ||
                !phase.completionCriteria.every(isNonEmptyString)
            ) {
                errors.push(`roadmap[${index}] is invalid.`);
            }
        });
    }

    if (!Array.isArray(data.recommendedProjects)) {
        errors.push("recommendedProjects must be an array.");
    } else {
        data.recommendedProjects.forEach((project, index) => {
            if (
                !project ||
                !isNonEmptyString(project.title) ||
                !isNonEmptyString(project.description) ||
                !Array.isArray(project.skillsPracticed) ||
                !project.skillsPracticed.every(isNonEmptyString)
            ) {
                errors.push(`recommendedProjects[${index}] is invalid.`);
            }
        });
    }

    if (
        !Array.isArray(data.nextActions) ||
        !data.nextActions.every(isNonEmptyString)
    ) {
        errors.push("nextActions must be an array of non-empty strings.");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

module.exports = { validateCareerRecommendations };