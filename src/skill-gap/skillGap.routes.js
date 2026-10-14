
const express = require("express");
const router = express.Router();

const passport = require("../passport");
const { getSkillGapController } = require("./skillGap.controller");

const authenticate = passport.authenticate("jwt", {
    session: false,
});

router.get("/", authenticate, getSkillGapController);

module.exports = router;
