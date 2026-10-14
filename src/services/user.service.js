
const prisma = require("../prisma");

const readUsers = async () => {
    const users = await prisma.user.findMany();
    return users;
};

// Get logged-in user's profile
const getMyProfile = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            candidateProfile: {
                include: {
                    experiences: true,
                    educations: true,
                    candidateSkills: {
                        include: {
                            skill: true
                        }
                    },
                    resumes: true
                }
            }
        }
    });
};

// Create or update profile
const updateMyProfile = async (userId, data) => {
    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
        throw new Error("Invalid User ID");
    }

    if (!data || typeof data !== "object") {
        throw new Error("Invalid profile data");
    }

    const {
        name,
        ...profileData
    } = data;

    return await prisma.$transaction(async (tx) => {
        if (name !== undefined) {
            await tx.user.update({
                where: { id: parsedUserId },
                data: { name }
            });
        }

        const profile = await tx.candidateProfile.upsert({
            where: { userId: parsedUserId },
            create: {
                userId: parsedUserId,
                ...profileData
            },
            update: profileData
        });

        return profile;
    });
};


// Update profile photo
const updateProfilePhoto = async (userId, photoUrl) => {
    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
        throw new Error("Invalid User ID");
    }

    if (!photoUrl) {
        throw new Error("Profile photo is required");
    }

    return await prisma.candidateProfile.update({
        where: {
            userId: parsedUserId
        },
        data: {
            avatarUrl: photoUrl
        },
        select: {
            id: true,
            userId: true,
            avatarUrl: true
        }
    });
};

module.exports = {
    readUsers,
    getMyProfile,
    updateMyProfile,
    updateProfilePhoto,
};
