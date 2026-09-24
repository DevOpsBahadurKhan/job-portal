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
    listCompanies
} = require("../controllers/company.controller");




// Create Company
router.post(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("create", "Company"),
    createCompany
);

router.get("/", passport.authenticate("jwt", {
    session: false
}), listCompanies);

// Get My Company
router.get(
    "/me",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("read", "Company"),
    getMyCompany
);


// Get Company By ID
router.get(
    "/:id",
    passport.authenticate("jwt", {
        session: false
    }),

    getCompanyById
);


// Update Company
router.patch(
    "/:id",
    passport.authenticate("jwt", {
        session: false
    }),
    loadResource("company", "id", "Company"),
    authorize("update", "Company"),
    updateCompany
);


module.exports = router;