const userService = require("../services/user.service");

const readUsers = async (req, res, next) => {
    try {
        const users = await userService.readUsers();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// GET logged-in user's profile
const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const profile = await userService.getMyProfile(
            Number(userId)
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

// PATCH logged-in user's profile
const updateMyProfile = async (req, res, next) => {
    try {
        const data = req.body;
        const userId = Number(req.user?.id);

        const profile =
            await userService.updateMyProfile(
                userId,
                data
            );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

// PATCH logged-in user's profile photo
const updateProfilePhoto = async (req, res, next) => {
    try {
        const userId = Number(req.user?.id);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile photo is required"
            });
        }

        const photoUrl =
            `/uploads/${req.uploadFolder}/${req.file.filename}`;

        const profile =
            await userService.updateProfilePhoto(
                userId,
                photoUrl
            );

        res.status(200).json({
            success: true,
            message: "Profile photo updated successfully",
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    readUsers,
    getMyProfile,
    updateMyProfile,
    updateProfilePhoto
};