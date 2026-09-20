const prisma = require("../prisma");

const updateUserRoleService = async (userId, role, logedInUserId) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }


    // Admin apna khud ka role change nahi kar sakta
    if (userId === logedInUserId && user.role === "ADMIN") {
        const err = new Error(
            "Admin cannot change their own role"
        );
        err.statusCode = 403;
        throw err;
    }

    if (role === "ADMIN") {
        const err = new Error(
            "ADMIN role cannot be assigned through this API"
        );
        err.statusCode = 403;
        throw err;
    }

    const updatedUser = await prisma.user.update({

        where: {
            id: userId
        },
        data: {
            role
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            updatedAt: true
        }
    });

    return updatedUser;
};

module.exports = {
    updateUserRoleService
};