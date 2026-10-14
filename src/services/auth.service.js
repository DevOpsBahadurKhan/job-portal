const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const redis = require("../config/redis");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("./email.service");
const { ALLOWED_REGISTRATION_ROLES } = require("../constants/roles");

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: String(user.role || "").toUpperCase()
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

const register = async (name, email, password, role) => {
    
    if (!ALLOWED_REGISTRATION_ROLES.has(role)) {
        const error = new Error("Invalid registration role");
        error.statusCode = 400;
        throw error;
    }
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }


    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role
        }
    });

    // Generate JWT
    const token = generateAccessToken(user);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    };
};

const login = async (email, password) => {
    console.log("DB QUERY START");
    const user = await prisma.user.findUnique({
        where: { email }
    });
    console.log("DB QUERY END");

    if (!user) {
        let error = new Error("Wrong Credentials");
        error.statusCode = 401;
        throw error;
    }


    if (!user.password) {
        let error = new Error("This account uses Google Login. Please sign in with Google.");
        error.statusCode = 400;
        throw error;
    }

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
        let error = new Error("Wrong Credentials");
        error.statusCode = 401;
        throw error;
    }

    // Generate JWT
    const token = generateAccessToken(user);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token
    };
};

const me = async (userId) => {
    const cacheKey = `user:profile:${userId}`;

    try {
        // 1. Check Redis cache
        try {
            const cachedUser = await redis.get(cacheKey);
            if (cachedUser) {
                console.log("Profile getting from cache");
                return JSON.parse(cachedUser);
            }
        } catch (error) {
            console.error("Redis GET error:", error.message);
        }

        // 2. Cache MISS: Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // 3. Save profile in Redis for 5 minutes
        try {
            await redis.set(
                cacheKey,
                JSON.stringify(user),
                "EX",
                300
            );
        } catch (error) {
            console.error("Redis SET error:", error.message);
        }

        return user;

    } catch (error) {
        throw error;
    }
};




const forgotPassword = async (email) => {
    const genericResponse = {
        message: "If an account exists, a reset link will be sent.",
    };

    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Keep the public response generic for unknown and Google-only accounts.
    if (!user || !user.password) {
        return genericResponse;
    }

    await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
    });

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
    });

    const resetUrl = new URL(
        "/reset-password",
        process.env.FRONTEND_URL
    );

    resetUrl.searchParams.set("token", token);

    try {
        await sendPasswordResetEmail(
            user.email,
            resetUrl.toString()
        );
    } catch (error) {
        // Remove the unusable token if email sending fails.
        await prisma.passwordResetToken.deleteMany({
            where: { tokenHash },
        });

        console.error(
            "Password reset email delivery failed:",
            error instanceof Error ? error.message : error
        );

        // Let the controller/global error handler return an error response.
        const emailError = new Error(
            "Unable to send the password reset email. Please try again later."
        );

        emailError.statusCode = 502;
        throw emailError;
    }

    // Never expose the reset token in the API response.
    return genericResponse;
};



// const forgotPassword = async (email) => {
//     const user = await prisma.user.findUnique({
//         where: { email },
//     });

//     // Generic response: account existence reveal nahi karna.
//     if (!user || !user.password) {
//         return {
//             message: "If an account exists, a reset link will be sent.",
//         };
//     }

//     // Purane unused reset tokens invalidate karo.
//     await prisma.passwordResetToken.deleteMany({
//         where: { userId: user.id },
//     });

//     // Cryptographically secure token.
//     const token = crypto.randomBytes(32).toString("hex");
//     const tokenHash = crypto.createHash("sha256")
//         .update(token)
//         .digest("hex");

//     await prisma.passwordResetToken.create({
//         data: {
//             userId: user.id,
//             tokenHash,
//             expiresAt: new Date(Date.now() + 15 * 60 * 1000),
//         },
//     });

//     // Email integration agle step mein add karenge.
//     // Original token sirf email link mein bhejna hai.
//     return {
//         message: "If an account exists, a reset link will be sent.",
//         resetToken: token, // DEVELOPMENT ONLY; email integration ke baad remove karo.
//     };
// };

const resetPassword = async (token, newPassword) => {
    if (!token || !newPassword) {
        const error = new Error("Token and new password are required.");
        error.statusCode = 400;
        throw error;
    }

    const tokenHash = crypto.createHash("sha256")
        .update(token)
        .digest("hex");

    const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
    });

    if (
        !resetRecord ||
        resetRecord.usedAt ||
        resetRecord.expiresAt <= new Date()
    ) {
        const error = new Error("Invalid or expired reset link.");
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await argon2.hash(newPassword);

    // Transaction prevents a reset token being consumed without
    // successfully updating the password.
    await prisma.$transaction(async (tx) => {
        const consumed = await tx.passwordResetToken.updateMany({
            where: {
                id: resetRecord.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: { usedAt: new Date() },
        });

        if (consumed.count !== 1) {
            const error = new Error("Invalid or expired reset link.");
            error.statusCode = 400;
            throw error;
        }

        await tx.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword },
        });

        // Invalidate every outstanding reset token for this user.
        await tx.passwordResetToken.deleteMany({
            where: {
                userId: resetRecord.userId,
                id: { not: resetRecord.id },
            },
        });

        // Existing refresh tokens must also be revoked.
        await tx.refreshToken.deleteMany({
            where: { userId: resetRecord.userId },
        });
    });

    // Invalidate cached profile, if present.
    try {
        await redis.del(`user:profile:${resetRecord.userId}`);
    } catch (error) {
        console.error("Redis cache invalidation failed:", error.message);
    }

    return { message: "Password reset successful. Please log in again." };
};


module.exports = {
    register,
    login,
    me,
    generateAccessToken,
    forgotPassword,
    resetPassword,
};
