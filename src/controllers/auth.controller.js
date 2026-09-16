const authService = require('../services/auth.service');

const register = async (req, res, next) => {

    try {

        const { name, email, password } = req.body;
        const user = await authService.register(name, email, password);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
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

        res.status(201).json({
            success: true,
            message: "Login successful",
            data: result
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
}

module.exports = {
    register, login, me
};