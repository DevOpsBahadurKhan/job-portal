const { subject } = require("@casl/ability");

const defineAbility = require("./ability");

const authorize = (action, subjectName) => {

    return (req, res, next) => {

        try {
            const ability = defineAbility(req.user);

            const resource = req.resource;

            if (!resource) {
                const err = new Error("Resource not found");
                err.statusCode = 404;
                return next(err);
            }

            const resourceSubject = subject(
                subjectName,
                resource
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