const prisma = require("../prisma");

const getMySubscriptionService = async (userId) => {
    // Check existing active subscription
    let subscription = await prisma.subscription.findFirst({
        where: {
            recruiterId: Number(userId),
            status: "ACTIVE",
        },
        include: {
            plan: true,
        },
    });

    // If subscription exists, return it
    if (subscription) {
        return subscription;
    }

    // Find FREE plan
    const freePlan = await prisma.plan.findUnique({
        where: {
            name: "FREE",
        },
    });

    if (!freePlan) {
        const error = new Error("FREE plan not found");
        error.statusCode = 404;
        throw error;
    }

    // Check whether user already has a pending subscription
    const existingSubscription =
        await prisma.subscription.findFirst({
            where: {
                recruiterId: Number(userId),
                status: "PENDING",
                planId: freePlan.id,
            },
        });

    if (existingSubscription) {
        return prisma.subscription.findUnique({
            where: {
                id: existingSubscription.id,
            },
            include: {
                plan: true,
            },
        });
    }

    // Assign FREE plan
    subscription = await prisma.subscription.create({
        data: {
            recruiterId: Number(userId),
            planId: freePlan.id,
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
        },
        include: {
            plan: true,
        },
    });

    return subscription;
};

module.exports = {
    getMySubscriptionService,
};