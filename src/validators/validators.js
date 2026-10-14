// D: \14 - DevOps - batch\devOps - 14 - notes\job portal\src\validators\validators.js

const { body, param } = require("express-validator");

const isEmail = body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isString()
    .withMessage("Email must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isLength({ max: 254 })
    .withMessage("Email must not exceed 254 characters")
    .bail()
    .isEmail({
        allow_display_name: false,
        require_display_name: false,
        allow_utf8_local_part: false,
        require_tld: true,
    })
    .withMessage("Enter a valid email address")
    .bail()
    .normalizeEmail();


const hasPassword = body("password")
    .notEmpty()
    .withMessage("Password is required.")
    // .bail()
    // .isString()
    // .withMessage("Password must be a string.")
    .bail()
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 8 and 128 characters.")
    // .bail()
    // .matches(/[a-z]/)
    // .withMessage("Password must contain a lowercase letter.")
    // .bail()
    // .matches(/[A-Z]/)
    // .withMessage("Password must contain an uppercase letter.")
    // .bail()
    // .matches(/[0-9]/)
    // .withMessage("Password must contain a number.")
    // .bail()
    // .matches(/[^A-Za-z0-9]/)
    // .withMessage("Password must contain a special character.")

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
