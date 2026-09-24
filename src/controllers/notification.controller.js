const notificationService =
    require("../services/notification.service");

const subscribe = async (req, res, next) => {

    try {

        const userId = req.user.id;
        const subscription = req.body;
        const result =
            await notificationService.savePushSubscription(
                userId,
                subscription
            );
        res.status(201).json({
            success: true,
            message: "Push subscription saved successfully",
            data: result
        });

    } catch (error) {

        next(error);
    }
};


const sendNotification = async (req, res, next) => {

    try {
        const userId = Number(req.user.id);
        const { title, message, url } = req.body;

        const notification =
            await notificationService.sendNotification({
                userId, title, message, url
            });

        res.status(201).json({
            success: true,
            message: "Notification sent successfully",
            data: notification
        });

    } catch (error) {

        next(error);
    }
};


module.exports = {
    subscribe,
    sendNotification
};