const { getPlansService } = require("../services/plan.service");

const getPlans = async (req, res, next) => {
    try {
        const plans = await getPlansService();

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