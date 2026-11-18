
const express = require("express");

const router = express();

const {
    trackSearch,
    getPopularSearches,
} = require("../controllers/search.controller");

const { searchJobs } = require("../elasticsearch/service");



// Existing routes — preserved
router.get("/popular", getPopularSearches);
router.post("/track", trackSearch);

// New Elasticsearch job search route
router.post("/jobs", async (req, res) => {
    try {
        const { q, location, jobType, page, limit } = req.query;

        const result = await searchJobs({
            q: typeof q === "string" ? q : "",
            location:
                typeof location === "string" ? location : undefined,
            jobType:
                typeof jobType === "string" ? jobType : undefined,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Elasticsearch job search error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to search jobs right now.",
        });
    }
});

module.exports = router;
