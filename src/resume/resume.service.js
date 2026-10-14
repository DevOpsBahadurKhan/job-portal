const prisma = require("../prisma");
const resumeQueue = require("../queues/resume.queue");

const usageService = require("../usage/usage.service");

const deleteResumeService = async ({ userId, resumeId }) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            profile: {
                userId,
            },
        },
    });

    if (!resume) {
        throw new Error("Resume not found");
    }

    // Don't allow deleting the only resume
    const resumeCount = await prisma.resume.count({
        where: {
            profile: {
                userId,
            },
        },
    });

    if (resumeCount === 1) {
        throw new Error(
            "You cannot delete your only resume"
        );
    }

    // If deleting default resume,
    // promote another resume to default.
    let replacementResume = null;

    if (resume.isDefault) {
        replacementResume = await prisma.resume.findFirst({
            where: {
                profile: {
                    userId,
                },
                id: {
                    not: resumeId,
                },
            },
            orderBy: {
                uploadedAt: "desc",
            },
        });
    }

    await prisma.$transaction(async (tx) => {
        if (replacementResume) {
            await tx.resume.update({
                where: {
                    id: replacementResume.id,
                },
                data: {
                    isDefault: true,
                },
            });
        }

        await tx.resume.delete({
            where: {
                id: resumeId,
            },
        });
    });

    return {
        deletedResumeId: resumeId,

        newDefaultResumeId:
            replacementResume?.id ?? null,
    };
};


const setDefaultResumeService = async ({ userId, resumeId }) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,

            profile: {
                userId,
            },
        },
    });

    if (!resume) {
        throw new Error("Resume not found");
    }

    // Remove default status from all user's resumes
    await prisma.resume.updateMany({
        where: {
            profile: {
                userId,
            },
            isDefault: true,
        },
        data: {
            isDefault: false,
        },
    });

    // Set requested resume as default
    const updatedResume = await prisma.resume.update({
        where: {
            id: resumeId,
        },
        data: {
            isDefault: true,
        },
    });

    return {
        id: updatedResume.id,
        fileName: updatedResume.fileName,
        isDefault: updatedResume.isDefault,
        status: updatedResume.status,
    };
};


const getUserResumes = async ({ userId }) => {
    const resumes = await prisma.resume.findMany({
        where: {
            profile: {
                userId,
            },
        },

        include: {
            analyses: {
                orderBy: {
                    createdAt: "desc",
                },

                take: 1,
            },
        },

        orderBy: {
            uploadedAt: "desc",
        },
    });

    return resumes.map((resume) => {
        const analysis = resume.analyses[0];

        return {
            id: resume.id,
            fileName: resume.fileName,
            fileType: resume.fileType,
            fileSize: resume.fileSize,
            status: resume.status,
            isDefault: resume.isDefault,
            uploadedAt: resume.uploadedAt,
            updatedAt: resume.updatedAt,

            analysis: analysis
                ? {
                    id: analysis.id,
                    overallScore:
                        analysis.overallScore,
                    atsScore:
                        analysis.atsScore,
                    createdAt:
                        analysis.createdAt,
                }
                : null,
        };
    });
};

const getResumeAnalysis = async ({ userId, resumeId }) => {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,

            profile: {
                userId,
            },
        },

        include: {
            analyses: {
                orderBy: {
                    createdAt: "desc",
                },

                take: 1,
            },
        },
    });

    if (!resume) {
        throw new Error("Resume not found");
    }

    const analysis = resume.analyses[0];

    return {
        resume: {
            id: resume.id,
            fileName: resume.fileName,
            fileType: resume.fileType,
            fileSize: resume.fileSize,
            status: resume.status,
            uploadedAt: resume.uploadedAt,
            updatedAt: resume.updatedAt,
        },

        analysis: analysis
            ? {
                id: analysis.id,
                overallScore:
                    analysis.overallScore,
                atsScore:
                    analysis.atsScore,
                summary:
                    analysis.summary,
                strengths:
                    analysis.strengths,
                weaknesses:
                    analysis.weaknesses,
                suggestions:
                    analysis.suggestions,
                skills:
                    analysis.skills,
                missingSkills:
                    analysis.missingSkills,
                keywords:
                    analysis.keywords,
                missingKeywords:
                    analysis.missingKeywords,
                experienceAnalysis:
                    analysis.experienceAnalysis,
                educationAnalysis:
                    analysis.educationAnalysis,
                projectsAnalysis:
                    analysis.projectsAnalysis,
                aiModel:
                    analysis.aiModel,
                inputTokens:
                    analysis.inputTokens,
                outputTokens:
                    analysis.outputTokens,
                totalTokens:
                    analysis.totalTokens,
                createdAt:
                    analysis.createdAt,
                updatedAt:
                    analysis.updatedAt,
            }
            : null,
    };
};



const uploadResumeService = async ({ userId, file }) => {
    const profile = await prisma.candidateProfile.findUnique({
        where: { userId },
    });

    if (!profile) {
        throw new Error("Candidate profile not found");
    }

    // Reserve one Resume Analyzer usage.
    const reservation = await usageService.reserveUsage(
        userId,
        "RESUME_ANALYSIS"
    );

    let resume;

    try {
        resume = await prisma.resume.create({
            data: {
                profileId: profile.id,
                fileName: file.filename,
                fileUrl: file.path,
                fileType: file.mimetype,
                fileSize: file.size,
                status: "PROCESSING",
            },
        });

        await resumeQueue.add(
            "process-resume",
            { resumeId: resume.id },
            { jobId: `resume-${resume.id}` }
        );

        return {
            id: resume.id,
            profileId: resume.profileId,
            fileName: resume.fileName,
            fileType: resume.fileType,
            fileSize: resume.fileSize,
            status: resume.status,
            uploadedAt: resume.uploadedAt,
            usage: {
                feature: reservation.feature,
                used: reservation.used,
                limit: reservation.limit,
                remaining: reservation.remaining,
            },
        };
    } catch (error) {
        // Roll back the reservation if submission fails.
        try {
            await usageService.releaseUsage(
                userId,
                reservation.feature,
                reservation.periodStart
            );
        } catch (releaseError) {
            console.error("Failed to release resume usage:", releaseError);
        }

        throw error;
    }
};


module.exports = {
    uploadResumeService,
    getResumeAnalysis, 
    getUserResumes,
    setDefaultResumeService,
    deleteResumeService
};