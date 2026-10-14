const express = require("express");
const passport = require("passport");

const {
    generateCareerGuidance,
} = require("./careerGuidance.controller");

const router = express.Router();

router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    generateCareerGuidance
);

module.exports = router;