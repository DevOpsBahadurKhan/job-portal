const express = require("express");
const router = express.Router();
const { loadResource } = require("../middleware/resource");
const { isInt, hasRole } = require('../validators/validators');
const validationHnadler = require('../validators/validationHnadler');
const { doubleCsrfProtection } = require('../middleware/csrf');

const { updateUserRole } = require("../controllers/admin.controller");


const passport = require("../passport");
const authorize = require("../middleware/authorize");

router.patch("/users/:userId/role",
    passport.authenticate("jwt", { session: false }),
    loadResource("user", "userId", "User"),
    authorize("update", "User"),
    [isInt, hasRole],
    validationHnadler,
    doubleCsrfProtection,
    updateUserRole
);

module.exports = router;