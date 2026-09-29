const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const redis = require("../config/redis");


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

const register = async (name, email, password) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
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
        where: {
            email
        }
    });
    console.log("DB QUERY END");
    if (!user) {
        let error = new Error("Wrong Credentials");
        error.statusCode = 401;
        throw error;
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

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


// const me = async (userId) => {
//     const user = await prisma.user.findUnique({
//         where: {
//             id: userId
//         },
//         select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             createdAt: true
//         }
//     });

//     if (!user) {
//         const err = new Error("User not found");
//         err.statusCode = 404;
//         throw err;
//     }
//     return user;
// }

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
            where: {
                id: userId,
            },
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

        // 4. Return user
        return user;

    } catch (error) {
        throw error;
    }
};

module.exports = {
    register,
    login,
    me,
    generateAccessToken
};