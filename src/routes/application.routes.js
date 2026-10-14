const express = require("express");
const router = express.Router();

const passport = require("../passport");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/upload");
const {
    applyJob,
    getMyApplications,
    updateRecruiterApplicationStatus,
    getRecruiterApplications,
} = require("../controllers/application.controller");



// Apply for Job
router.post(
    "/:jobId/apply",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("create", "Application"),

    (req, res, next) => {
        req.uploadFolder = "resumes";
        req.allowedMimeTypes = ["application/pdf"];
        next();
    },

    upload.single("file"),
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

router.patch(
    "/recruiter/:applicationId/status",
    passport.authenticate("jwt", {
        session: false,
    }),
    updateRecruiterApplicationStatus
);


router.get(
    "/recruiter",
    passport.authenticate("jwt", {
        session: false,
    }),
    getRecruiterApplications
);


module.exports = router;