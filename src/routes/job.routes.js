const express = require("express");
const passport = require("../passport");

const authorize = require("../middleware/role");
const { loadJob } = require("../middleware/resource");
const {
    createJob, updateJob
} = require("../controllers/job.controller");

const router = express.Router();

router.post(
    "/",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("RECRUITER"),
    createJob
);


router.patch(
    "/:id",
    passport.authenticate("jwt", {
        session: false
    }),
    authorize("RECRUITER"),
    loadJob,
    authorize("update", "Job"),
    updateJob
);

module.exports = router;