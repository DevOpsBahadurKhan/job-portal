const prisma = require("../prisma");

const getPlansService = async () => {
    return await prisma.plan.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            price: "asc",
        },
    });
};

module.exports = {
    getPlansService,
};