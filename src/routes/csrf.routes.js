const express = require("express");
const router = express.Router();
const { doubleCsrfProtection } = require("../middleware/csrf")
const {
    generateToken,
} = require("../middleware/csrf");

router.get(
    "/csrf-token", doubleCsrfProtection,
    (req, res, next) => {
        try {
            const csrfToken = generateToken(req, res);

            return res.status(200).json({
                success: true,
                data: {
                    csrfToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;