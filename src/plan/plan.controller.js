const { getActivePlans } = require("./plan.service");

const getPlans = async (req, res, next) => {
    try {
        const role = req.user?.role;

        let targetAudience;

        if (role === "CANDIDATE") {
            targetAudience = "CANDIDATE";
        } else if (role === "RECRUITER") {
            targetAudience = "RECRUITER";
        } else {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view these plans",
            });
        }

        const plans = await getActivePlans(targetAudience);

        return res.status(200).json({
            success: true,
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlans,
};