const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    keyGenerator: (req) => {
        return req.body?.email?.toLowerCase().trim() || req.ip;
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,

    handler: (req, res, next) => {
        const error = new Error(
            "Too many login attempts. Please try again after 5 minutes."
        );
        error.statusCode = 429;
        next(error);
    },
});


// Google OAuth Limiter

const googleOAuthLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 2,

    // Default IP-based key; no email required
    standardHeaders: "draft-8",
    legacyHeaders: false,

    handler: (req, res, next) => {
        const error = new Error(
            "Too many Google login attempts. Please try again after 5 minute."
        );

        error.statusCode = 429;
        error.code = "GOOGLE_RATE_LIMIT";

        next(error);
    },
});


module.exports = {
    loginLimiter,
    googleOAuthLimiter
};