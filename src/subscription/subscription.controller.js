
const subscriptionService = require("./subscription.service");

const getMySubscription = async (req, res) => {
    try {
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

const subscribe = async (req, res) => {
    try {
        const userId = Number(req.user?.id);
        const planId = Number(req.body?.planId);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!Number.isInteger(planId) || planId <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid planId is required",
            });
        }

        const data = await subscriptionService.subscribeToPlan({
            userId,
            planId,
        });

        return res.status(data.requiresPayment ? 202 : 201).json({
            success: true,
            message: data.message,
            data: {
                subscription: data.subscription,
                requiresPayment: data.requiresPayment,
            },
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;

        if (statusCode === 500) {
            console.error("Subscribe to plan error:", error);
        }

        return res.status(statusCode).json({
            success: false,
            message:
                statusCode === 500
                    ? "Unable to subscribe to this plan"
                    : error.message,
        });
    }
};



const cancelSubscription = async (req, res) => {
    try {
        const userId = Number(req.user.id);
        const subscriptionId = Number(req.params.id);

        if (
            !Number.isInteger(userId) ||
            userId <= 0 ||
            !Number.isInteger(subscriptionId) ||
            subscriptionId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID.",
            });
        }

        const subscription = await subscriptionService.cancelMySubscription(
            userId,
            subscriptionId
        );

        return res.status(200).json({
            success: true,
            message:
                subscription.cancelAtPeriodEnd
                    ? "Subscription will be cancelled at the end of the current billing period."
                    : "Pending subscription cancelled successfully.",
            data: subscription,
        });
    } catch (error) {
        console.error("Cancel subscription error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.statusCode
                    ? error.message
                    : "Failed to cancel subscription.",
        });
    }
};


module.exports = {
    getMySubscription,
    subscribe,
    cancelSubscription,
};
