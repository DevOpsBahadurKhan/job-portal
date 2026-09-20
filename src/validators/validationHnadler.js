//D:\14-DevOps-batch\devOps-14-notes\job portal\src\validators\validationHnadler.js

const { validationResult } = require('express-validator');

const validationHnadler =  (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.validation = validationErrors.array();
        return next(error);
    }
    next();
}

module.exports = validationHnadler;