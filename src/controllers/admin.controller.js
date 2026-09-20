const {
    updateUserRoleService
} = require("../services/admin.service");

const updateUserRole = async (req, res, next) => {
    try {
        const userId = Number(req.params.userId);
        const logedInUserId = Number(req.user.id);

        const { role } = req.body;

        const user = await updateUserRoleService(
            userId,
            role, logedInUserId
        );

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateUserRole
};