const {
    createCompanyService
} = require("../services/company.service");

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

module.exports = {
    createCompany
};