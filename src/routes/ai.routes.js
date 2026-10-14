const express = require("express");
const router = express.Router();

const passport = require("../passport");
const { chatWithAI } = require("../controllers/ai.controller");

router.post(
    "/chat",
    passport.authenticate("jwt", { session: false }),
    chatWithAI
);

module.exports = router;