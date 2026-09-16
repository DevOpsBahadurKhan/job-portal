const express = require("express");
const passport = require("../passport");
const { readUsers } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", passport.authenticate("jwt", {
    session: false
}), readUsers);

module.exports = router;