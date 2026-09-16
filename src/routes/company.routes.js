const express = require("express");

const passport = require("../passport");
const authorize = require("../middleware/role");

const {
    createCompany
} = require("../controllers/company.controller");

const router = express.Router();

router.post(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("RECRUITER"),
    createCompany
);

module.exports = router;