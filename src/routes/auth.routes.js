const express = require("express");
const { isEmail, hasPassword, hasName } = require('../validators/validators');
const passport = require("../passport");
const validationHnadler = require("../validators/validationHnadler");
const { register, login, me } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register",
    [isEmail, hasPassword, hasName],
    validationHnadler, register);

router.post("/login",
    [isEmail, hasPassword],
    validationHnadler, login);

router.get('/profile', passport.authenticate("jwt", {
    session: false
}), me);

module.exports = router;