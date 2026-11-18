const prisma = require("../prisma");
const { client, INDEX } = require("./index");

function formatJob(job) {
    return {
        jobId: String(job.id),
        title: job.title,
        description: job.description,
        companyName: job.company?.name || "",
        location: job.location || "",
        skills: job.skills || "",
        jobType: job.jobType,
        status: job.status,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        createdAt: job.createdAt,
    };
}

async function indexJob(jobId) {
    const job = await prisma.job.findUnique({
        where: { id: Number(jobId) },
        include: { company: true },
    });

    if (!job) {
        return deleteJob(jobId);
    }

    await client.index({
        index: INDEX,
        id: String(job.id),
        document: formatJob(job),
        refresh: true,
    });

    return { success: true, jobId: job.id };
}

async function deleteJob(jobId) {
    const result = await client.delete({
        index: INDEX,
        id: String(jobId),
        refresh: true,
        ignore_unavailable: true,
    }).catch((error) => {
        if (error.meta?.statusCode === 404) {
            return { result: "not_found" };
        }

        throw error;
    });

    return { success: true, result: result.result };
}

async function syncAllJobs() {
    const jobs = await prisma.job.findMany({
        include: { company: true },
    });

    if (jobs.length === 0) {
        return { total: 0 };
    }

    const operations = jobs.flatMap((job) => [
        { index: { _index: INDEX, _id: String(job.id) } },
        formatJob(job),
    ]);

    const response = await client.bulk({
        operations,
        refresh: true,
    });

    if (response.errors) {
        const failures = response.items
            .filter((item) => item.index?.error)
            .map((item) => ({
                id: item.index?._id,
                error: item.index?.error,
            }));

        console.error("Some jobs failed to index:", failures);
        throw new Error(`${failures.length} jobs failed to index`);
    }

    return { total: jobs.length };
}

async function searchJobs({
    q = "",
    location,
    jobType,
    page = 1,
    limit = 10,
} = {}) {
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));

    const filters = [{ term: { status: "OPEN" } }];

    if (jobType) {
        filters.push({ term: { jobType } });
    }

    if (location) {
        filters.push({
            match: {
                location: {
                    query: location,
                    operator: "and",
                },
            },
        });
    }

    const response = await client.search({
        index: INDEX,
        from: (pageNumber - 1) * pageSize,
        size: pageSize,
        query: {
            bool: {
                must: q.trim()
                    ? [
                        {
                            multi_match: {
                                query: q.trim(),
                                fields: [
                                    "title^3",
                                    "companyName^2",
                                    "skills^2",
                                    "description",
                                    "location",
                                ],
                                fuzziness: "AUTO",
                            },
                        },
                    ]
                    : [{ match_all: {} }],
                filter: filters,
            },
        },
        sort: [{ createdAt: "desc" }],
    });

    return {
        total: response.hits.total.value,
        page: pageNumber,
        limit: pageSize,
        jobs: response.hits.hits.map((hit) => ({
            ...hit._source,
            id: Number(hit._id),
            score: hit._score,
        })),
    };
}

module.exports = {
    indexJob,
    deleteJob,
    syncAllJobs,
    searchJobs,
};