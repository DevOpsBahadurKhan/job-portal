const express = require("express");
const passport = require("../passport");
const { readUsers } = require("../controllers/user.controller");
const authorize = require("../middleware/authorize");
const { loadResource } = require("../middleware/resource");

const router = express.Router();

router.get("/", passport.authenticate("jwt", {
    session: false
}),
    // loadResource("user","id","User"),
    // authorize("read", "User"),
    readUsers);

module.exports = router;