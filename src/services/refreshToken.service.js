const prisma = require("../prisma");

const {
    generateRefreshToken,
    hashRefreshToken,
} = require("../utils/refreshToken");

// CREATE REFRESH TOKEN
const createRefreshToken = async (userId, rememberMe = false) => {
    const token = generateRefreshToken();
    const tokenHash = hashRefreshToken(token);

    const expiresAt = new Date(
        Date.now() +
        (rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000)
    );

    // const expiresAt = new Date(
    //     Date.now() +
    //     (rememberMe
    //         ? 1 * 60 * 1000   // 1 minute
    //         : 1 * 60 * 1000)   // 1 minute
    // );

    await prisma.refreshToken.create({
        data: {
            tokenHash,
            expiresAt,
            userId,
            rememberMe,
        },
    });

    return token;
};

// ROTATE REFRESH TOKEN
const rotateRefreshToken = async (rawToken) => {
    if (!rawToken) {
        const error = new Error("Refresh token required");
        error.statusCode = 401;
        throw error;
    }

    const tokenHash = hashRefreshToken(rawToken);

    const existingToken =
        await prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
            include: {
                user: true,
            },
        });

    if (
        !existingToken ||
        existingToken.expiresAt <= new Date()
    ) {
        const error = new Error(
            "Invalid or expired refresh token"
        );
        error.statusCode = 401;
        throw error;
    }

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(
        Date.now() +
        (existingToken.rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000)
    );

    // const expiresAt = new Date(
    //     Date.now() +
    //     (existingToken.rememberMe
    //         ? 1 * 60 * 1000
    //         : 1 * 60 * 1000)
    // );

    await prisma.$transaction(async (tx) => {
        const deleted =
            await tx.refreshToken.deleteMany({
                where: {
                    id: existingToken.id,
                    tokenHash,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });

        if (deleted.count !== 1) {
            const error = new Error(
                "Refresh token already used or invalid"
            );
            error.statusCode = 401;
            throw error;
        }

        await tx.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                expiresAt,
                userId: existingToken.userId,
                rememberMe: existingToken.rememberMe,
            },
        });
    });

    return {
        refreshToken: newRefreshToken,
        user: existingToken.user,
        rememberMe: existingToken.rememberMe,
    };
};

module.exports = {
    createRefreshToken,
    rotateRefreshToken,
};