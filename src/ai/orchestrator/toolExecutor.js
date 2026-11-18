const { searchJobs } = require("../tools/jobSearch.tool");
const { getMyProfile } = require("../tools/profile.tool");
const { jobRecommendation } = require("../tools/jobRecommendation.tool");

const toolHandlers = {
    search_jobs: searchJobs,
    get_my_profile: getMyProfile,
    job_recommendation: jobRecommendation,
};

async function executeTool(name, args, context) {
    const handler = toolHandlers[name];

    if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
    }

    return handler(args, context);
}

module.exports = { executeTool };
