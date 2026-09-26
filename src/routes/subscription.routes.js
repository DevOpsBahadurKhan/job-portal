const express = require("express");
const router = express.Router();

const passport = require("../passport");

const {
    getMySubscription,
} = require("../controllers/subscription.controller");

router.get(
    "/me",
    passport.authenticate("jwt", {
        session: false,
    }),
    getMySubscription
);

module.exports = router;