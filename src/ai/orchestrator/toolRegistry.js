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
];

const toolDeclarations = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
}));

module.exports = { toolDeclarations };