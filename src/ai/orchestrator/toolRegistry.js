const tools = [
    {
        name: "search_jobs",
        description:
            "Search available jobs using keywords and location.",
        parameters: {
            type: "OBJECT",
            properties: {
                keyword: {
                    type: "STRING",
                    description: "Job title or skill",
                },
                location: {
                    type: "STRING",
                    description: "Job location",
                },
            },
            required: ["keyword"],
        },
    },
    {
        name: "get_my_profile",
        description:
            "Get the authenticated candidate's profile.",
        parameters: {
            type: "OBJECT",
            properties: {},
        },
    },
    {
        name: "job_recommendation",
        description:
            "Recommend relevant jobs using the authenticated candidate's profile, preferred roles, and preferred locations. Use this when the user asks for personalized job recommendations. Explicit keyword or location filters provided by the user should take priority over profile defaults.",
        parameters: {
            type: "OBJECT",
            properties: {
                keyword: {
                    type: "STRING",
                    description:
                        "Optional job title or skill specified by the user.",
                },
                location: {
                    type: "STRING",
                    description:
                        "Optional job location specified by the user.",
                },
            },
        },
    },
];

const toolDeclarations = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
}));

module.exports = { toolDeclarations };