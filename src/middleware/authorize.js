const { subject } = require("@casl/ability");
const defineAbility = require("./ability");

const authorize = (action, subjectName) => {
    return (req, res, next) => {
        try {
            const ability = defineAbility(req.user);

            // Routes without a preloaded resource, such as /me
            if (!req.resource) {
                if (!ability.can(action, subjectName)) {
                    const err = new Error("Access denied");
                    err.statusCode = 403;
                    return next(err);
                }

                return next();
            }

            const resourceSubject = subject(
                subjectName,
                req.resource
            );

            if (!ability.can(action, resourceSubject)) {
                const err = new Error("Access denied");
                err.statusCode = 403;
                return next(err);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = authorize;