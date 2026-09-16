const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

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

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};

const login = async (email, password) => {

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

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

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

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


const me = async (userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select:{
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }
    return user;
}

module.exports = {
    register,
    login,
    me
};