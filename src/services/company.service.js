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

module.exports = {
    createCompanyService
};