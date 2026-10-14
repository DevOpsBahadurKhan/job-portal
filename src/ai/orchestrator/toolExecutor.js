const prisma = require("../../prisma");

const toolHandlers = {
    async search_jobs(args) {
        const keyword = args.keyword?.trim();
        const location = args.location?.trim();

        if (!keyword || keyword.length > 100) {
            throw new Error("Invalid job keyword");
        }

        const jobs = await prisma.job.findMany({
            where: {
                status: "OPEN",
                AND: [
                    {
                        OR: [
                            {
                                title: {
                                    contains: keyword,
                                    mode: "insensitive",
                                },
                            },
                            {
                                skills: {
                                    contains: keyword,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    ...(location
                        ? [{
                            location: {
                                contains: location,
                                mode: "insensitive",
                            },
                        }]
                        : []),
                ],
            },
            select: {
                id: true,
                title: true,
                description: true,
                location: true,
                salaryMin: true,
                salaryMax: true,
                skills: true,
            },
            take: 10,
        });

        console.log("Complete result:", jobs);
        console.log("Jobs found:", jobs.length);


        return jobs;
    },

    async get_my_profile(args, context) {
        if (!context.userId) {
            throw new Error("Authentication required");
        }

        return prisma.user.findUnique({
            where: { id: context.userId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    },
};

async function executeTool(name, args, context) {
    const handler = toolHandlers[name];

    if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
    }

    return handler(args, context);
}

module.exports = { executeTool };