
const prisma = require("../prisma");

const trackSearchService = async (keyword) => {
    const normalizedKeyword = keyword.trim().replace(/\s+/g, " ");

    if (!normalizedKeyword || normalizedKeyword.length > 100) {
        const error = new Error("Keyword must be between 1 and 100 characters.");
        error.statusCode = 400;
        throw error;
    }

    await prisma.jobSearchEvent.create({
        data: { keyword: normalizedKeyword },
    });

    return { tracked: true };
};

const getPopularSearchesService = async (limit = 8) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const events = await prisma.jobSearchEvent.groupBy({
        by: ["keyword"],
        where: { createdAt: { gte: since } },
        _count: { keyword: true },
        orderBy: { _count: { keyword: "desc" } },
        take: limit,
    });

    return events.map((event) => ({
        keyword: event.keyword,
        searchCount: event._count.keyword,
    }));
};





module.exports = {
    trackSearchService,
    getPopularSearchesService,
    
};
