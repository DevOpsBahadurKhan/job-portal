const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = String(req.user?.role || "").toUpperCase();
        const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());

        if (!req.user) {
            const err = new Error("Authentication required");
            err.statusCode = 401;
            throw err;
        }

        if (!normalizedAllowedRoles.includes(userRole)) {
            const err = new Error("Access denied");
            err.statusCode = 403;
            throw err;
        }

        next();
    };
};

module.exports = authorize;