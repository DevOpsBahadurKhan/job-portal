const {
    getMySubscriptionService,
} = require("../services/subscription.service");

const getMySubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const subscription =
            await getMySubscriptionService(userId);

        return res.status(200).json({
            success: true,
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMySubscription,
};