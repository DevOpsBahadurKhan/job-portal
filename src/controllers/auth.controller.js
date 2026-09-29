const authService = require("../services/auth.service");
const refreshTokenService = require("../services/refreshToken.service");


// Common cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
        process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
    path: "/",
};

// Access token: 15 minutes
const accessCookieOptions = {
    ...cookieOptions,
    maxAge: 1 * 60 * 1000,
};

// Refresh token: 7 days
const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};


// REGISTER
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const result = await authService.register(
            name,
            email,
            password
        );

        // Set access token
        res.cookie(
            "accessToken",
            result.token,
            accessCookieOptions
        );

        // Generate and store refresh token
        const refreshToken =
            await refreshTokenService.createRefreshToken(
                result.user.id
            );

        // Set refresh token cookie
        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result.user,
        });

    } catch (error) {
        next(error);
    }
};


// LOGIN
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.login(
            email,
            password
        );

        // Set access token
        res.cookie(
            "accessToken",
            result.token,
            accessCookieOptions
        );

        // Generate and store refresh token
        const refreshToken =
            await refreshTokenService.createRefreshToken(
                result.user.id
            );

        // Set refresh token cookie
        res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result.user,
        });

    } catch (error) {
        next(error);
    }
};


// GET MY PROFILE
const me = async (req, res, next) => {
    try {
        const user = await authService.me(req.user.id);
        user['name'] = user.name.replace(/\b\w/g, char => char.toUpperCase());

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};

// REFRESH TOKEN
const refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;

        const result =
            await refreshTokenService.rotateRefreshToken(token);

        // Generate new access token
        const accessToken = authService.generateAccessToken(result.user);

        res.cookie(
            "accessToken",
            accessToken,
            accessCookieOptions
        );

        // Set rotated refresh token
        res.cookie(
            "refreshToken",
            result.refreshToken,
            refreshCookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
        });
    } catch (error) {
        next(error);
    }
};





// LOGOUT
const logout = (req, res, next) => {
    try {
        // Clear access token
        res.clearCookie(
            "accessToken",
            cookieOptions
        );

        // Clear refresh token cookie
        res.clearCookie(
            "refreshToken",
            cookieOptions
        );

        // Clear CSRF cookie
        res.clearCookie(
            "csrf-token",
            cookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Logout successful",
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    register,
    login,
    me,
    logout,
    refresh,
};