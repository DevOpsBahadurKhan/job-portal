const prisma = require("../prisma");

const createCompanyService = async (companyData, ownerId) => {

    const {
        name,
        description,
        website,
        location
    } = companyData;

    // Check if recruiter already owns a company
    const existingCompany = await prisma.company.findUnique({
        where: {
            ownerId
        }
    });

    if (existingCompany) {
        const err = new Error("You already have a company");
        err.statusCode = 409;
        throw err;
    }

    const company = await prisma.company.create({
        data: {
            name,
            description,
            website,
            location,
            ownerId
        }
    });

    return company;
};


const getCompanyByIdService = async (companyId, userId) => {
    const company = await prisma.company.findUnique({
        where: {
            id: Number(companyId),
            ownerId: Number(userId)
        }
    });

    if (!company) {
        const err = new Error("Company not found");
        err.statusCode = 404;
        throw err;
    }

    return company;
};


const deleteCompanyByIdService = async (companyId, userId) => {
    const company = await prisma.company.findFirst({
        where: {
            id: Number(companyId),
            ownerId: Number(userId),
        },
    });

    if (!company) {
        const err = new Error("Company not found");
        err.statusCode = 404;
        throw err;
    }

    return prisma.company.delete({
        where: { id: company.id },
    });
};


const getMyCompanyService = async (ownerId) => {
    const company = await prisma.company.findUnique({
        where: {
            ownerId
        }
    });

    if (!company) {
        const err = new Error("Company not found");
        err.statusCode = 404;
        throw err;
    }

    return company;
}


const updateCompanyService = async (companyId, userId, userRole, companyData) => {

    const existingCompany = await prisma.company.findUnique({
        where: {
            id: Number(companyId)
        }
    });

    if (!existingCompany) {
        const err = new Error("Company not found");
        err.statusCode = 404;
        throw err;
    }

    // Owner OR Super Admin can update
    if (existingCompany.ownerId !== userId && userRole !== "SUPER_ADMIN") {
        const err = new Error("You are not allowed to update this company");
        err.statusCode = 403;
        throw err;
    }

    const {
        name,
        description,
        website,
        location
    } = companyData;

    const company = await prisma.company.update({
        where: {
            id: Number(companyId)
        },
        data: {
            name,
            description,
            website,
            location
        }
    });

    return company;
};

const listCompaniesService = async () => {
    const companies = await prisma.company.findMany();
    return companies;
}


const getTopCompaniesService = async (limit = 5) => {
    const companies = await prisma.company.findMany({
        take: limit,
        select: {
            id: true,
            name: true,
            description: true,
            website: true,
            location: true,
            _count: {
                select: {
                    jobs: {
                        where: { status: "OPEN" },
                    },
                },
            },
        },
    });

    return companies
        .map((company) => ({
            id: company.id,
            name: company.name,
            description: company.description,
            website: company.website,
            location: company.location,
            openJobsCount: company._count.jobs,
        }))
        .sort((a, b) => b.openJobsCount - a.openJobsCount)
        .slice(0, limit);
};


module.exports = {
    createCompanyService,
    getMyCompanyService,
    getCompanyByIdService,
    updateCompanyService,
    listCompaniesService,
    deleteCompanyByIdService,
    getTopCompaniesService

};