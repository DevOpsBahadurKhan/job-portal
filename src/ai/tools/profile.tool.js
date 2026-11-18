
const prisma = require("../../prisma");

async function getMyProfile(args, context = {}) {
    if (!context.userId) {
        throw new Error("Authentication required");
    }

    return prisma.user.findUnique({
        where: { id: context.userId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });
}

module.exports = { getMyProfile };
