// D: \14 - DevOps - batch\devOps - 14 - notes\job portal\src\validators\validators.js

const { body, param } = require("express-validator");

const isEmail = body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email");

const hasPassword = body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters");

const hasName = body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 5 characters");

// updateUserRoleValidator
const isInt = param("userId").isInt()
    .withMessage("User ID must be a valid integer");
const hasRole = body("role")
    .isIn(["CANDIDATE", "RECRUITER"]).withMessage(
        "Role must be CANDIDATE or RECRUITER");

module.exports = {
    isEmail,
    hasPassword,
    hasName,
    isInt,
    hasRole
};
