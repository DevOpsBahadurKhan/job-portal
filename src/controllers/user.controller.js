const userService = require("../services/user.service");



const readUsers = async (req, res, next) => {
    try {
        const user = await userService.readUsers();

        res.status(201).json({
            success: true,
            message: "Users fetched successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
        readUsers
};