
const {
    trackSearchService,
    getPopularSearchesService,
} = require("../services/search.service");

const trackSearch = async (req, res, next) => {
    try {
        const { keyword } = req.body;

        if (typeof keyword !== "string") {
            return res.status(400).json({
                success: false,
                message: "Keyword is required.",
            });
        }

        const data = await trackSearchService(keyword);

        return res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const getPopularSearches = async (req, res, next) => {
    try {
        const requestedLimit = Number(req.query.limit ?? 8);
        const limit = Number.isInteger(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 20)
            : 8;

        const data = await getPopularSearchesService(limit);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { trackSearch, getPopularSearches };
