const applyJobService = async (jobId, candidateId, applicationData) => {

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
        const err = new Error("This job is not open for applications");
        err.statusCode = 400;
        throw err;
    }

    // Check candidate already applied
    const existingApplication = await prisma.application.findUnique({
        where: {
            jobId_candidateId: {
                jobId,
                candidateId
            }
        }
    });

    if (existingApplication) {
        const err = new Error("You have already applied for this job");
        err.statusCode = 409;
        throw err;
    }

    // Create application
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