
const express = require("express");
const passport = require("../passport");
const upload = require("../middleware/upload");

const {
    readUsers,
    getMyProfile,
    updateMyProfile,
    updateProfilePhoto
} = require("../controllers/user.controller");

const { loadResource } = require("../middleware/resource");

const authorize = require("../middleware/authorize");


const router = express.Router();

const authenticate = passport.authenticate("jwt", {
    session: false
});

// Existing users route
router.get(
    "/",
    authenticate,
    // authorize("read", "User"),
    readUsers
);

// Get logged-in user's profile
router.get(
    "/me/profile",
    authenticate,
    getMyProfile
);

// Create or update logged-in user's profile
router.patch(
    "/me/profile",
    authenticate,
    updateMyProfile
);


// Update logged-in user's profile photo
router.patch(
    "/me/profile/photo",
    authenticate,

    (req, res, next) => {
        req.uploadFolder = "profile-photos";
        req.allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];
        next();
    },

    upload.single("file"),
    updateProfilePhoto
);


module.exports = router;
