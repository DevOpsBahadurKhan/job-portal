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


module.exports = {
    applyJobService,
    getMyApplicationsService,
};