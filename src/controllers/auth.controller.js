const authService = require('../services/auth.service');

const register = async (req, res, next) => {

    try {

        const { name, email, password } = req.body;

        const result = await authService.register(
            name,
            email,
            password
        );

        // Set JWT in HttpOnly Cookie
        res.cookie("accessToken", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result.user
        });

    } catch (error) {

        next(error);

    }
};


const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        const result = await authService.login(
            email,
            password
        );

        res.cookie("accessToken", result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: "Login successful",
            data: result.user
        });

    } catch (error) {

        next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await authService.me(req.user.id);

        res.status(201).json({
            success: true,
            message: "Profile fetched successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

module.exports = {
    register, login, me, logout
};