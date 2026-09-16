const authorize = (...allowedRoles) => {
    return (req, res, next) => {

        console.log("ROLE:", req.user?.role);
        console.log("NEXT:", typeof next);

        if (!req.user) {
            const err = new Error("Authentication required");
            err.statusCode = 401;
            throw err;
        }

        if (!allowedRoles.includes(req.user.role)) {
            const err = new Error("Access denied");
            err.statusCode = 403;
            throw err;
        }

        next();
    };
};

module.exports = authorize;