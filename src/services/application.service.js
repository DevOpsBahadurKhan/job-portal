const prisma = require("../prisma");



const getHasAppliedService = async (jobId, candidateId) => {
    const application = await prisma.application.findUnique({
        where: {
            jobId_candidateId: {
                jobId: Number(jobId),
                candidateId: Number(candidateId)
            }
        },
        select: {
            id: true
        }
    });

    return !!application;
};


const applyJobService = async (
    jobId,
    candidateId,
    applicationData
) => {
    const { coverLetter, resumeUrl } = applicationData;

    // Check job exists
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

    // Check job is open
    if (job.status !== "OPEN") {
        const err = new Error(
            "This job is not open for applications"
        );
        err.statusCode = 400;
        throw err;
    }

    // Check candidate already applied
    const existingApplication =
        await prisma.application.findUnique({
            where: {
                jobId_candidateId: {
                    jobId,
                    candidateId
                }
            }
        });

    if (existingApplication) {
        const err = new Error(
            "You have already applied for this job"
        );
        err.statusCode = 409;
        throw err;
    }

    // Create application with uploaded resume
    const application = await prisma.application.create({
        data: {
            coverLetter,
            resumeUrl,
            jobId,
            candidateId
        }
    });

    return application;
};

const getMyApplicationsService = async (candidateId) => {

    const applications = await prisma.application.findMany({
        where: {
            candidateId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {

            job: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    salaryMin: true,
                    salaryMax: true,
                    jobType: true,
                    status: true,
                    skills: true,

                    company: {
                        select: {
                            id: true,
                            name: true,
                            location: true,
                            website: true
                        }
                    }
                }
            }

        }
    });
    return applications;
}



const getRecruiterApplicationsService = async (recruiterId) => {
    return prisma.application.findMany({
        where: {
            job: {
                recruiterId: Number(recruiterId),
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            job: {
                select: {
                    id: true,
                    title: true,
                    location: true,
                    salaryMin: true,
                    salaryMax: true,
                    jobType: true,
                    status: true,
                    company: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            candidate: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};


const updateRecruiterApplicationStatusService = async (
    applicationId,
    recruiterId,
    status
) => {
    const allowedStatuses = [
        "APPLIED",
        "PENDING",
        "SHORTLISTED",
        "ACCEPTED",
        "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
        const error = new Error("Invalid application status");
        error.statusCode = 400;
        throw error;
    }

    const application = await prisma.application.findFirst({
        where: {
            id: Number(applicationId),
            job: {
                recruiterId: Number(recruiterId),
            },
        },
        select: {
            id: true,
        },
    });

    if (!application) {
        const error = new Error(
            "Application not found or access denied"
        );
        error.statusCode = 404;
        throw error;
    }

    return prisma.application.update({
        where: {
            id: application.id,
        },
        data: {
            status,
        },
    });
};


module.exports = {
    applyJobService,
    getMyApplicationsService,
    getRecruiterApplicationsService,
    updateRecruiterApplicationStatusService
};