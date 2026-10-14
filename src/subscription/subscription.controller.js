const subscriptionService = require("./subscription.service");

const getMySubscription = async (req, res) => {
    try {
        // Adjust this if your authentication middleware uses another field.
        const userId = Number(req.user?.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const data = await subscriptionService.getMySubscription(userId);

        return res.status(200).json({
            success: true,
            message: "Subscription fetched successfully",
            data,
        });
    } catch (error) {
        console.error("Get my subscription error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch subscription",
        });
    }
};

module.exports = {
    getMySubscription,
};