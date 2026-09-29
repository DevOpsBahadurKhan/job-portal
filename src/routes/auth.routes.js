const express = require("express");
const { isEmail, hasPassword, hasName } = require('../validators/validators');
const passport = require("../passport");
const { doubleCsrfProtection, generateToken } = require('../middleware/csrf');
const validationHnadler = require("../validators/validationHnadler");
const { register, login, me, refresh, logout } = require("../controllers/auth.controller");
const { loginLimiter } = require("../middleware/rateLimiter");


const router = express.Router();

router.post("/register",
    [isEmail, hasPassword, hasName],
    loginLimiter,
    validationHnadler,
    register);

router.post("/login",
    [isEmail, hasPassword],
    loginLimiter,
    validationHnadler,
    login);

router.get('/profile', passport.authenticate("jwt", {
    session: false
}),
    doubleCsrfProtection,
    me);

router.post(
    "/logout",
    passport.authenticate("jwt", {
        session: false,
    }),
    doubleCsrfProtection,
    logout
);


router.post(
    "/refresh",
    doubleCsrfProtection,
    refresh
);



module.exports = router;