const webpush = require("../config/webpush");
const prisma = require("../prisma");

const savePushSubscription = async (userId, subscription) => {

    const { endpoint, keys } = subscription;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        throw new Error("Invalid push subscription");
    }

    const existingSubscription =
        await prisma.pushSubscription.findFirst({
            where: {
                userId,
                endpoint
            }
        });

    if (existingSubscription) {

        return prisma.pushSubscription.update({
            where: {
                id: existingSubscription.id
            },
            data: {
                p256dh: keys.p256dh,
                auth: keys.auth
            }
        });
    }

    return prisma.pushSubscription.create({
        data: {
            userId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth
        }
    });
};



const sendNotification = async ({
    userId,
    title,
    message,
    url
}) => {

    const notification = await prisma.notification.create({
        data: {
            userId,
            title,
            message,
            url
        }
    });

    const subscriptions =
        await prisma.pushSubscription.findMany({
            where: {
                userId
            }
        });

    const payload = JSON.stringify({
        title,
        message,
        url
    });

    for (const subscription of subscriptions) {

        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        try {

            await webpush.sendNotification(
                pushSubscription,
                payload
            );

        } catch (error) {

            /*
             * 410 means the subscription is no longer valid.
             */

            if (error.statusCode === 404 ||
                error.statusCode === 410) {

                await prisma.pushSubscription.delete({
                    where: {
                        id: subscription.id
                    }
                });
            } else {

                console.error(
                    "Push notification failed:",
                    error
                );
            }
        }
    }

    return notification;
};

module.exports = {
    savePushSubscription,
    sendNotification
};