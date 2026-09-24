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

module.exports = {
    createCompanyService,
    getMyCompanyService,
    getCompanyByIdService,
    updateCompanyService,
    listCompaniesService,

};