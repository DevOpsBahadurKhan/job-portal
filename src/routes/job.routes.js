const express = require("express");
const passport = require("../passport");
const { loadResource } = require("../middleware/resource");
const authorize = require("../middleware/authorize");

const {
    createJob,
    updateJob,
    deleteJob,
    listJob,
    getJobById,
    getJobApplications,
    updateApplicationStatus
} = require("../controllers/job.controller");

const router = express.Router();

// Get all jobs
router.get("/", listJob);

// Create job (recruiter only)
router.post("/",
    passport.authenticate("jwt", {
        session: false
    }),

    authorize("create", "Job"),
    createJob
);

// Get job by ID
router.get("/:id",
    getJobById,
);

// Get all applications for a recruiter-owned job
router.get("/:id/applications",
    passport.authenticate("jwt", {
        session: false
    }),
    loadResource("job", "id", "Job"),
    authorize("read", "Job"),
    getJobApplications
);

// Update application status for a recruiter-owned job
router.patch("/:id/applications/:applicationId/status",
    passport.authenticate("jwt", {
        session: false
    }),
    loadResource("job", "id", "Job"),
    authorize("update", "Job"),
    updateApplicationStatus
);

// Update job (recruiter only)
router.patch("/:id",
    passport.authenticate("jwt", {
        session: false
    }),
    loadResource("job", "id", "Job"),
    authorize("update", "Job"),
    updateJob
);

// Delete job (recruiter only)
router.delete("/:id",
    passport.authenticate("jwt", {
        session: false
    }),
    loadResource("job", "id", "Job"),
    authorize("delete", "Job"),
    deleteJob
);

module.exports = router;