const express = require("express");
const router = express.Router();

const { getMySubscription } = require("./subscription.controller");

// Replace this import with your existing JWT authentication middleware path.
const passport = require("../passport");

const authenticate = passport.authenticate("jwt", {
    session: false,
});

router.get("/me", authenticate, getMySubscription);

module.exports = router;