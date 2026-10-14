
const prisma = require("../prisma");

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const validModes = ["ONLINE", "PHONE", "IN_PERSON"];

const validateInterviewData = (data, { partial = false } = {}) => {
    const {
        scheduledAt,
        durationMinutes,
        mode,
        meetingLink,
        location,
    } = data;

    if (!partial || scheduledAt !== undefined) {
        const date = new Date(scheduledAt);

        if (!scheduledAt || Number.isNaN(date.getTime())) {
            throw createError("Valid scheduledAt is required", 400);
        }

        if (date <= new Date()) {
            throw createError("Interview must be scheduled in the future", 400);
        }
    }

    if (durationMinutes !== undefined) {
        if (
            !Number.isInteger(Number(durationMinutes)) ||
            Number(durationMinutes) < 1 ||
            Number(durationMinutes) > 480
        ) {
            throw createError(
                "durationMinutes must be between 1 and 480",
                400
            );
        }
    } else if (!partial) {
        data.durationMinutes = 30;
    }

    if (mode !== undefined && !validModes.includes(mode)) {
        throw createError(
            "mode must be ONLINE, PHONE, or IN_PERSON",
            400
        );
    }

    const effectiveMode = mode;

    if (effectiveMode === "ONLINE" && !meetingLink?.trim()) {
        throw createError("meetingLink is required for online interviews", 400);
    }

    if (effectiveMode === "IN_PERSON" && !location?.trim()) {
        throw createError("location is required for in-person interviews", 400);
    }
};

const assertRecruiterOwnsApplication = async (
    applicationId,
    recruiterId
) => {
    const application = await prisma.application.findFirst({
        where: {
            id: Number(applicationId),
            job: {
                recruiterId: Number(recruiterId),
            },
        },
        select: {
            id: true,
        },
    });

    if (!application) {
        throw createError("Application not found or access denied", 404);
    }

    return application;
};

const assertRecruiterOwnsInterview = async (
    interviewId,
    recruiterId
) => {
    const interview = await prisma.interview.findFirst({
        where: {
            id: Number(interviewId),
            application: {
                job: {
                    recruiterId: Number(recruiterId),
                },
            },
        },
        include: {
            application: {
                select: {
                    id: true,
                    candidateId: true,
                    jobId: true,
                },
            },
        },
    });

    if (!interview) {
        throw createError("Interview not found or access denied", 404);
    }

    return interview;
};

const createInterviewService = async (
    applicationId,
    recruiterId,
    data
) => {
    const application = await assertRecruiterOwnsApplication(
        applicationId,
        recruiterId
    );

    const input = { ...data };
    validateInterviewData(input);

    return prisma.interview.create({
        data: {
            applicationId: application.id,
            scheduledAt: new Date(input.scheduledAt),
            durationMinutes: Number(input.durationMinutes),
            mode: input.mode || "ONLINE",
            meetingLink: input.meetingLink?.trim() || null,
            location: input.location?.trim() || null,
            notes: input.notes?.trim() || null,
        },
        include: {
            application: {
                include: {
                    job: {
                        select: {
                            id: true,
                            title: true,
                            recruiterId: true,
                        },
                    },
                    candidate: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};

const getApplicationInterviewsService = async (
    applicationId,
    recruiterId
) => {
    const application = await assertRecruiterOwnsApplication(
        applicationId,
        recruiterId
    );

    return prisma.interview.findMany({
        where: {
            applicationId: application.id,
        },
        orderBy: {
            scheduledAt: "desc",
        },
    });
};

const updateInterviewService = async (
    interviewId,
    recruiterId,
    data
) => {
    const existing = await assertRecruiterOwnsInterview(
        interviewId,
        recruiterId
    );

    if (existing.status === "CANCELLED") {
        throw createError("Cancelled interviews cannot be updated", 400);
    }

    const allowedFields = [
        "scheduledAt",
        "durationMinutes",
        "mode",
        "meetingLink",
        "location",
        "notes",
    ];

    const input = {};

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            input[field] = data[field];
        }
    }

    if (Object.keys(input).length === 0) {
        throw createError("Provide at least one field to update", 400);
    }

    const effectiveData = {
        scheduledAt: input.scheduledAt ?? existing.scheduledAt,
        durationMinutes:
            input.durationMinutes ?? existing.durationMinutes,
        mode: input.mode ?? existing.mode,
        meetingLink: input.meetingLink ?? existing.meetingLink,
        location: input.location ?? existing.location,
    };

    // Partial updates ko existing interview values ke saath validate karo.
    validateInterviewData(effectiveData);

    if (input.scheduledAt !== undefined) {
        input.scheduledAt = new Date(input.scheduledAt);
    }

    if (input.durationMinutes !== undefined) {
        input.durationMinutes = Number(input.durationMinutes);
    }

    for (const field of ["meetingLink", "location", "notes"]) {
        if (input[field] !== undefined) {
            input[field] = input[field]?.trim() || null;
        }
    }

    return prisma.interview.update({
        where: {
            id: existing.id,
        },
        data: input,
    });
};

const cancelInterviewService = async (interviewId, recruiterId) => {
    const existing = await assertRecruiterOwnsInterview(
        interviewId,
        recruiterId
    );

    if (existing.status === "CANCELLED") {
        throw createError("Interview is already cancelled", 400);
    }

    return prisma.interview.update({
        where: {
            id: existing.id,
        },
        data: {
            status: "CANCELLED",
        },
    });
};

module.exports = {
    createInterviewService,
    getApplicationInterviewsService,
    updateInterviewService,
    cancelInterviewService,
};
