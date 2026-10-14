
const express = require("express");
const router = express.Router();

const passport = require("../passport");
const { loadResource } = require("../middleware/resource");
const authorize = require("../middleware/authorize");

const {
    createCompany,
    getMyCompany,
    getCompanyById,
    updateCompany,
    listCompanies,
    deleteCompanyById,
    getTopCompanies,
} = require("../controllers/company.controller");

const authenticate = passport.authenticate("jwt", {
    session: false,
});

// 1. List companies
router.get(
    "/",
    authenticate,
    listCompanies
);

// 2. Get logged-in user's company
router.get(
    "/me",
    authenticate,
    authorize("read", "Company"),
    getMyCompany
);

// 3. Get top companies
router.get(
    "/top",
    getTopCompanies
);

// 4. Get company by ID
router.get(
    "/:id",
    authenticate,
    loadResource("company", "id", "Company"),
    authorize("read", "Company"),
    getCompanyById
);

// 5. Delete company by ID
router.delete(
    "/:id",
    authenticate,
    loadResource("company", "id", "Company"),
    authorize("delete", "Company"),
    deleteCompanyById
);

// 6. Create company
router.post(
    "/",
    authenticate,
    authorize("create", "Company"),
    createCompany
);

// 7. Update company by ID
router.patch(
    "/:id",
    authenticate,
    loadResource("company", "id", "Company"),
    authorize("update", "Company"),
    updateCompany
);

module.exports = router;
