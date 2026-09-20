const prisma = require("../prisma");

const loadResource = (model, paramName, resourceName) => {

    return async (req, res, next) => {

        try {

            const id = Number(req.params[paramName]);

            if (!Number.isInteger(id)) {
                const err = new Error(`Invalid ${resourceName} ID`);
                err.statusCode = 400;
                return next(err);
            }

            const resource = await prisma[model].findUnique({
                where: {
                    id
                }
            });

            if (!resource) {
                const err = new Error(`${resourceName} not found`);
                err.statusCode = 404;
                return next(err);
            }

            req.resource = resource;

            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = {loadResource};
