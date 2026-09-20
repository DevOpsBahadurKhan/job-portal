const express = require("express");
const router = express.Router();
const { loadResource } = require("../middleware/resource");
const { isInt, hasRole } = require('../validators/validators');
const validationHnadler = require('../validators/validationHnadler');

const { updateUserRole } = require("../controllers/admin.controller");


const passport = require("../passport");
const authorize = require("../middleware/authorize");

router.patch("/users/:userId/role",
    passport.authenticate("jwt", { session: false }),
    loadResource("user", "userId", "User"),
    authorize("update", "User"),
    [isInt, hasRole], validationHnadler, updateUserRole
);

module.exports = router;