
const express = require("express");
const router = express.Router();

const passport = require("../passport");

const {
    createInterview,
    getApplicationInterviews,
    updateInterview,
    cancelInterview,
} = require("../controllers/interview.controller");

const authenticate = passport.authenticate("jwt", {
    session: false,
});

// Schedule interview for an application
router.post(
    "/applications/:applicationId",
    authenticate,
    createInterview
);

// List interviews for an application
router.get(
    "/applications/:applicationId",
    authenticate,
    getApplicationInterviews
);

// Reschedule or update interview details
router.patch(
    "/:interviewId",
    authenticate,
    updateInterview
);

// Cancel an interview
router.patch(
    "/:interviewId/cancel",
    authenticate,
    cancelInterview
);

module.exports = router;
