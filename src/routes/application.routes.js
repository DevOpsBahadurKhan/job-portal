const express = require("express");
const router = express.Router();

const passport = require("../passport");
const authorize = require("../middleware/authorize");

const {
    applyJob,
    getMyApplications
} = require("../controllers/application.controller");



// Apply for Job
router.post(
    "/jobs/:jobId/apply",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("create", "Application"),
    applyJob
);


// My Applications
router.get(
    "/my",
    passport.authenticate("jwt", {
        session: false
    }),
    getMyApplications
);


module.exports = router;