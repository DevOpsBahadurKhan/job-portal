const prisma = require("../prisma");

const normalizeSkill = (skill) => {
    return String(skill)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

const parseSkills = (skills) => {
    if (!skills) {
        return [];
    }

    if (Array.isArray(skills)) {
        return skills
            .map(normalizeSkill)
            .filter(Boolean);
    }

    if (typeof skills === "string") {
        return skills
            .split(",")
            .map(normalizeSkill)
            .filter(Boolean);
    }

    return [];
};

const calculateMatch = ({
    resumeSkills,
    jobSkills,
}) => {
    const resumeSet = new Set(
        resumeSkills.map(normalizeSkill)
    );

    const normalizedJobSkills = jobSkills.map(
        normalizeSkill
    );

    const matchedSkills = normalizedJobSkills.filter(
        (skill) => resumeSet.has(skill)
    );

    const missingSkills = normalizedJobSkills.filter(
        (skill) => !resumeSet.has(skill)
    );

    const totalSkills = normalizedJobSkills.length;

    const matchScore =
        totalSkills === 0
            ? 0
            : Math.round(
                (matchedSkills.length /
                    totalSkills) *
                100
            );

    return {
        matchScore,
        matchedSkills,
        missingSkills,
    };
};

const matchResumeWithJob = async ({ userId, resumeId, jobId }) => {
    // ==========================================
    // 1. Get user's resume
    // ==========================================

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

    if (resume.status !== "COMPLETED") {
        throw new Error(
            "Resume processing is not completed"
        );
    }

    // ==========================================
    // 2. Get job
    // ==========================================

    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
        },
    });

    if (!job) {
        throw new Error("Job not found");
    }

    // ==========================================
    // 3. Get resume skills
    // ==========================================

    const analysis = resume.analyses[0];

    const resumeSkills = parseSkills(
        analysis?.skills
    );

    // ==========================================
    // 4. Get job skills
    // ==========================================

    const jobSkills = parseSkills(
        job.skills
    );

    if (jobSkills.length === 0) {
        throw new Error(
            "Job does not have any required skills"
        );
    }

    // ==========================================
    // 5. Calculate match
    // ==========================================

    const {
        matchScore,
        matchedSkills,
        missingSkills,
    } = calculateMatch({
        resumeSkills,
        jobSkills,
    });

    // ==========================================
    // 6. Save / update match
    // ==========================================

    const match = await prisma.resumeJobMatch.upsert({
        where: {
            resumeId_jobId: {
                resumeId,
                jobId,
            },
        },

        create: {
            resumeId,
            jobId,
            matchScore,
            matchedSkills,
            missingSkills,
            matchedKeywords: [],
            missingKeywords: [],
            recommendations: [],
        },

        update: {
            matchScore,
            matchedSkills,
            missingSkills,
            matchedKeywords: [],
            missingKeywords: [],
            recommendations: [],
        },
    });

    return {
        id: match.id,
        resumeId: match.resumeId,
        jobId: match.jobId,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        matchedKeywords: match.matchedKeywords,
        missingKeywords: match.missingKeywords,
        recommendations: match.recommendations,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
    };
};

module.exports = {
    matchResumeWithJob,
};