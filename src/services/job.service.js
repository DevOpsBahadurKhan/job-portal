const prisma = require("../prisma");

const createJobService = async (jobData, recruiterId) => {

    const {
        title,
        description,
        location,
        salaryMin,
        salaryMax,
        jobType,
        status,
        skills,
        companyId
    } = jobData;

    // Check company exists
    const company = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!company) {
        const err = new Error("Company not found");
        err.statusCode = 404;
        throw err;
    }

    // Check recruiter owns the company
    if (company.ownerId !== recruiterId) {
        const err = new Error;
        err.message = "You can only create jobs for your own company";
        err.statusCode = 403;
        throw err;
    }

    // Create job
    const job = await prisma.job.create({
        data: {
            title,
            description,
            location,
            salaryMin,
            salaryMax,
            jobType,
            status,
            skills,
            companyId,
            recruiterId
        }
    });

    return job;
};



const updateJobService = async (jobId, jobData) => {

    const {
        title,
        description,
        location,
        salaryMin,
        salaryMax,
        jobType,
        status,
        skills,
        companyId
    } = jobData;

    // If companyId is being changed, check company exists
    if (companyId !== undefined) {

        const company = await prisma.company.findUnique({
            where: {
                id: companyId
            }
        });

        if (!company) {
            const err = new Error("Company not found");
            err.statusCode = 404;
            throw err;
        }
    }

    const job = await prisma.job.update({
        where: {
            id: jobId
        },
        data: {
            title,
            description,
            location,
            salaryMin,
            salaryMax,
            jobType,
            status,
            skills,
            companyId
        }
    });

    return job;
};


const deleteJobService = async (jobId) => {
    const job = await prisma.job.delete({
        where: {
            id: jobId
        },
    });

    return job;
}


const listJobService = async ({
    page = 1,
    limit = 10,
    search,
    location,
    jobType,
    salaryMin
}) => {

    page = Number(page);
    limit = Number(limit);

    if (page < 1) {
        page = 1;
    }

    if (limit < 1) {
        limit = 10;
    }

    if (limit > 100) {
        limit = 100;
    }

    const skip = (page - 1) * limit;

    const where = {
        status: "OPEN"
    };

    // Search by job title
    if (search) {
        where.title = {
            contains: search
        };
    }

    // Location filter
    if (location) {
        where.location = {
            contains: location
        };
    }

    // Job type filter
    if (jobType) {
        where.jobType = jobType;
    }

    // Minimum salary filter
    if (salaryMin) {
        where.salaryMin = {
            gte: Number(salaryMin)
        };
    }

    const [jobs, totalJobs] = await Promise.all([

        prisma.job.findMany({
            where,

            skip,
            take: limit,

            orderBy: [
                {
                    createdAt: "desc"
                },
                {
                    id: "desc"
                }
            ],

            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        website: true
                    }
                }
            }
        }),

        prisma.job.count({
            where
        })

    ]);

    const totalPages = Math.ceil(
        totalJobs / limit
    );

    return {
        jobs,

        pagination: {
            page,
            limit,
            total: totalJobs,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
};

const getJobByIdService = async (jobId) => {

    const job = await prisma.job.findUnique({
        where: {
            id: jobId
        }
    });


    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    return job;

};

const getJobApplicationsService = async (jobId, recruiterId) => {
    const job = await prisma.job.findUnique({
        where: {
            id: Number(jobId)
        }
    });

    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    if (job.recruiterId !== Number(recruiterId)) {
        const err = new Error("You can only view applications for your own jobs");
        err.statusCode = 403;
        throw err;
    }

    return prisma.application.findMany({
        where: {
            jobId: Number(jobId)
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            candidate: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    company: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });
};

const updateApplicationStatusService = async ({
    jobId,
    applicationId,
    recruiterId,
    status
}) => {
    const job = await prisma.job.findUnique({
        where: {
            id: Number(jobId)
        }
    });

    if (!job) {
        const err = new Error("Job not found");
        err.statusCode = 404;
        throw err;
    }

    if (job.recruiterId !== Number(recruiterId)) {
        const err = new Error("You can only update applications for your own jobs");
        err.statusCode = 403;
        throw err;
    }

    const application = await prisma.application.findUnique({
        where: {
            id: Number(applicationId)
        }
    });

    if (!application) {
        const err = new Error("Application not found");
        err.statusCode = 404;
        throw err;
    }

    if (application.jobId !== Number(jobId)) {
        const err = new Error("Application does not belong to this job");
        err.statusCode = 400;
        throw err;
    }

    const allowedStatuses = ["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"];

    if (!allowedStatuses.includes(status)) {
        const err = new Error("Invalid application status");
        err.statusCode = 400;
        throw err;
    }

    return prisma.application.update({
        where: {
            id: Number(applicationId)
        },
        data: {
            status
        },
        include: {
            candidate: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            job: {
                select: {
                    id: true,
                    title: true,
                    company: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });
};

module.exports = {
    createJobService,
    updateJobService,
    deleteJobService,
    listJobService,
    getJobByIdService,
    getJobApplicationsService,
    updateApplicationStatusService
};