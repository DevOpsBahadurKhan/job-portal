
const { validationResult } = require("express-validator");

const validationHnadler = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        const errors = validationErrors.array();

        const error = new Error(errors[0].msg);
        error.statusCode = 422;
        error.validation = errors.map((item) => ({
            field: item.path,
            message: item.msg,
        }));

        return next(error);
    }

    next();
};

module.exports = validationHnadler;
