const express = require("express");
const router = express.Router();
const { razorpayWebhook } = require("./payment.controller");

router.post("/", razorpayWebhook);

module.exports = router;