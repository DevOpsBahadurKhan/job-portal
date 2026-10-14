
const express = require("express");
const {
    trackSearch,
    getPopularSearches,
} = require("../controllers/search.controller");

const router = express.Router();

router.get("/popular", getPopularSearches);
router.post("/track", trackSearch);

module.exports = router;
