const prisma = require("../../prisma");
function validateSearchJobsInput(args = {}) {
    const keyword = args.keyword?.trim();
    const location = args.location?.trim();
    if (
        typeof args.keyword !== "string" ||
        !keyword ||
        keyword.length > 100
    ) {
        throw new Error("Invalid job keyword");
    }
    if (
        args.location != null &&
        (
            typeof args.location !== "string" ||
            location.length > 100
        )
    ) {
        throw new Error("Invalid job location");
    }
    return { keyword, location };
}

async function searchJobs(args) {
    const { keyword, location } =
        validateSearchJobsInput(args);
    return prisma.job.findMany({
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
}
module.exports = {
    searchJobs,
    validateSearchJobsInput,
};
