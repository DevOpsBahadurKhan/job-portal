const { searchJobs } = require("./jobSearch.tool");

async function jobRecommendation(args = {}, context = {}) {
    const { userId, profile } = context;

    if (!userId) {
        throw new Error("Authentication required");
    }

    const preferredRoles = profile?.preferredRoles ?? [];
    const preferredLocations = profile?.preferredLocations ?? [];

    const keyword =
        args.keyword?.trim() ||
        preferredRoles[0];

    if (!keyword) {
        return {
            jobs: [],
            message: "Please add your preferred job roles to your profile.",
        };
    }

    const location =
        args.location?.trim() ||
        preferredLocations[0];

    const jobs = await searchJobs({ keyword, location });

    return {
        jobs,
        message: jobs.length
            ? "Jobs matching your preferences were found."
            : "No matching jobs found. Try updating your preferences.",
    };
}

module.exports = { jobRecommendation };