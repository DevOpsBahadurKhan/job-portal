
const express = require("express");
const router = express.Router();

const {
    getMySubscription,
    subscribe,
    cancelSubscription,
    
} = require("./subscription.controller");

const passport = require("../passport");

const authenticate = passport.authenticate("jwt", {
    session: false,
});

router.get("/me", authenticate, getMySubscription);
router.post("/subscribe", authenticate, subscribe);
router.post("/:id/cancel", authenticate, cancelSubscription);

module.exports = router;
