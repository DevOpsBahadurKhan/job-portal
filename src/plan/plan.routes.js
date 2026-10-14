const express = require("express");
const router = express.Router();

const { getPlans } = require("./plan.controller");

const passport = require("../passport");

const authenticate = passport.authenticate("jwt", {
    session: false,
});

router.get("/", authenticate ,getPlans);

module.exports = router;