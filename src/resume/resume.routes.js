const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const passport = require("../passport");

const {
    uploadResume,
    getResumeAnalysisController,
    getUserResumesController,
    setDefaultResumeController,
    deleteResumeController,
    matchResumeWithJobController
} = require("./resume.controller");

const authenticate = passport.authenticate("jwt", {
    session: false,
});





// ==========================================
// GET ALL USER RESUMES
// ==========================================

router.get(
    "/",
    authenticate,
    getUserResumesController
);

// ==========================================
// GET RESUME ANALYSIS
// ==========================================

router.get(
    "/:resumeId/analysis",
    authenticate,
    getResumeAnalysisController
);


// ==========================================
// set Default Resume
// ==========================================

router.patch(
    "/:resumeId/default",
    authenticate,
    setDefaultResumeController
);


// ==========================================
// Delete Resume
// ==========================================
router.delete(
    "/:resumeId",
    authenticate,
    deleteResumeController
);

// ==========================================
// Match resume with jobs
// ==========================================
router.post(
    "/:resumeId/match/:jobId",
    authenticate,
    matchResumeWithJobController
);

// ==========================================
// UPLOAD RESUME
// ==========================================

router.post(
    "/",
    authenticate,

    (req, res, next) => {
        req.uploadFolder = "resumes";

        req.allowedMimeTypes = [
            "application/pdf",
        ];

        next();
    },

    upload.single("file"),
    uploadResume
);

module.exports = router;