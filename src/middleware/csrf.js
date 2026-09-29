const { doubleCsrf } = require("csrf-csrf");

if (!process.env.CSRF_SECRET) {
    throw new Error(
        "CSRF_SECRET is missing in environment variables"
    );
}

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,

    getSessionIdentifier: () => "job-portal",

    cookieName: "csrf-token",

    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
        path: "/",
    },

    getCsrfTokenFromRequest: (req) =>
        req.headers["x-csrf-token"],
});

// Export using the old name so existing routes keep working
module.exports = {
    generateToken: generateCsrfToken,
    doubleCsrfProtection,
};