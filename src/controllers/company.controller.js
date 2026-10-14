const {
    createCompanyService,
    getMyCompanyService,
    getCompanyByIdService,
    updateCompanyService,
    listCompaniesService,
    deleteCompanyByIdService,
    getTopCompaniesService
} = require("../services/company.service");


const listCompanies = async (req, res, next) => {
    try {
        const companies = await listCompaniesService();

        res.status(201).send({
            success: true,
            message: "Companies fetched successfully",
            data: companies
        });

    } catch (error) {
        next(error);
    }
}

const createCompany = async (req, res, next) => {
    try {

        const company = await createCompanyService(
            req.body,
            req.user.id
        );

        res.status(201).send({
            success: true,
            message: "Company created successfully",
            data: company
        });

    } catch (error) {
        next(error);
    }
};


const getMyCompany = async (req, res, next) => {
    try {
        const id = Number(req.user.id);

        const company = await getMyCompanyService(id);

        return res.status(200).json({
            success: true,
            message: "Company fetched successfully",
            data: company
        });
    } catch (error) {
        next(error);
    }
};


const getCompanyById = async (req, res, next) => {
    try {
        const company = await getCompanyByIdService(req.params.id, req.user.id);

        return res.status(200).json({
            success: true,
            message: "Company fetched successfully",
            data: company
        });
    } catch (error) {
        next(error);
    }
};
const deleteCompanyById = async (req, res, next) => {
    try {
        const company = await deleteCompanyByIdService(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully",
            data: company,
        });
    } catch (error) {
        next(error);
    }
};


const updateCompany = async (req, res, next) => {
    try {
        const company = await updateCompanyService(
            req.params.id,
            req.user.id,
            req.user.role,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: company
        });
    } catch (error) {
        next(error);
    }
};


const getTopCompanies = async (req, res, next) => {
    try {
        console.log("🔥 TOP COMPANIES CONTROLLER HIT");

        const requestedLimit = Number(req.query.limit ?? 5);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 20)
            : 5;

        const companies = await getTopCompaniesService(limit);

        return res.status(200).json({
            success: true,
            message: "Top companies fetched successfully",
            data: companies,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createCompany,
    getMyCompany,
    getCompanyById,
    updateCompany,
    listCompanies,
    deleteCompanyById,
    getTopCompanies
};