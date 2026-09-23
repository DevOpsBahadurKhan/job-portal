const express = require("express");

const passport = require("../passport");

const {
    subscribe,
    sendNotification
} = require("../controllers/notification.controller");

const router = express.Router();


// Register browser push subscription
router.post(
    "/subscribe",
    passport.authenticate("jwt", {
        session: false
    }),
    subscribe
);


// Send notification
router.post(
    "/send",
    passport.authenticate("jwt", {
        session: false
    }),
    sendNotification
);


module.exports = router;