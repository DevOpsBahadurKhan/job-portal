const express = require("express");

const passport = require("../passport");
const authorize = require("../middleware/role");

const {
    applyJob
} = require("../controllers/application.controller");

const router = express.Router();

router.post(
    "/jobs/:jobId/apply",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("CANDIDATE"),
    applyJob
);

module.exports = router;