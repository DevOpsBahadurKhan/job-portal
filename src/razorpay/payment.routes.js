const express = require("express");
const router = express.Router();

const paymentController = require("./payment.controller");
const passport = require("passport");

router.post(
    "/create-order",
    passport.authenticate("jwt", { session: false }),
    paymentController.createOrder
);


router.post(
    "/verify",
    passport.authenticate("jwt", { session: false }),
    paymentController.verifyPaymentController
);


module.exports = router;