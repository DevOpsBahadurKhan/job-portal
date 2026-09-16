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
        const err = new Error(
            "You can only create jobs for your own company"
        );
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

module.exports = {
    createJobService,
    updateJobService

};