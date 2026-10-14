
const { ai, MODEL } = require("../ai/orchestrator/geminiClient");
const prisma = require("../prisma");

const normalizeSkill = (skill) => {
    const normalized = String(skill)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const aliases = {
        "jwt authentication": "jwt",
        "jwt auth": "jwt",
        "json web token": "jwt",
        "json web tokens": "jwt",
        nodejs: "node.js",
        "node js": "node.js",
        postgres: "postgresql",
        "postgre sql": "postgresql",
        js: "javascript",
        ts: "typescript",
        express: "express.js",
        "express js": "express.js",
        mongo: "mongodb",
        "mongo db": "mongodb",
    };

    return aliases[normalized] || normalized;
};

const toSkillArray = (value) => {
    if (Array.isArray(value)) {
        return value
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const generateLearningRoadmap = async ({
    missingSkills,
    targetJobTitle = "General career development",
}) => {
    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
        return [];
    }

    const prompt = `
You are an expert technical career mentor.

Create a practical learning roadmap for a candidate.

Target role: ${targetJobTitle}

Skills the candidate needs to learn:
${JSON.stringify(missingSkills)}

Requirements:
1. Cover every missing skill.
2. Arrange skills in a sensible learning order.
3. Keep each step beginner-friendly and practical.
4. Include a hands-on task for every skill.
5. Give a realistic estimated duration.
6. Do not claim the candidate already knows a missing skill.
7. Do not add skills outside the provided missing skills.
8. Return ONLY valid JSON in this structure:

{
  "learningRoadmap": [
    {
      "skill": "PostgreSQL",
      "priority": 1,
      "estimatedDuration": "3-5 days",
      "topicsToLearn": ["SQL queries", "Joins", "Indexes"],
      "practicalTask": "Build a small database and write queries",
      "expectedOutcome": "Understand relational database fundamentals"
    }
  ]
}
`;

    // Propagate AI errors so the controller can release reserved usage.
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    let parsed;

    try {
        parsed = JSON.parse(response.text);
    } catch {
        throw new Error("Invalid JSON returned by AI roadmap generation");
    }

    if (!Array.isArray(parsed.learningRoadmap)) {
        throw new Error("AI returned an invalid learning roadmap");
    }

    const missingSkillSet = new Set(missingSkills.map(normalizeSkill));

    return parsed.learningRoadmap
        .filter(
            (item) =>
                item &&
                typeof item.skill === "string" &&
                missingSkillSet.has(normalizeSkill(item.skill))
        )
        .map((item, index) => ({
            skill: item.skill,
            priority: index + 1,
            estimatedDuration:
                typeof item.estimatedDuration === "string"
                    ? item.estimatedDuration
                    : "To be determined",
            topicsToLearn: Array.isArray(item.topicsToLearn)
                ? item.topicsToLearn.filter(
                    (topic) => typeof topic === "string"
                )
                : [],
            practicalTask:
                typeof item.practicalTask === "string"
                    ? item.practicalTask
                    : "",
            expectedOutcome:
                typeof item.expectedOutcome === "string"
                    ? item.expectedOutcome
                    : "",
        }));
};

// Fetch and validate source data without calling AI.
const getSkillGapBaseData = async ({ userId, jobId }) => {
    const profile = await prisma.candidateProfile.findUnique({
        where: { userId },
        select: {
            id: true,
            resumes: {
                where: { isDefault: true },
                take: 1,
                select: {
                    id: true,
                    fileName: true,
                    status: true,
                    analyses: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            },
        },
    });

    if (!profile) {
        throw new Error("Candidate profile not found");
    }

    const resume = profile.resumes[0];

    if (!resume) {
        throw new Error("Please set a default resume first");
    }

    if (resume.status !== "COMPLETED") {
        throw new Error("Your default resume is not processed yet");
    }

    const analysis = resume.analyses[0];

    if (!analysis) {
        throw new Error("Resume analysis not found");
    }

    const currentSkills = toSkillArray(analysis.skills);
    let missingSkills = toSkillArray(analysis.missingSkills);
    let targetJob = null;
    let recommendations = toSkillArray(analysis.suggestions);
    let requiredSkills;
    let matchedSkills;

    if (jobId !== undefined && jobId !== null) {
        const parsedJobId = Number(jobId);

        if (!Number.isSafeInteger(parsedJobId) || parsedJobId <= 0) {
            throw new Error("Invalid jobId");
        }

        targetJob = await prisma.job.findUnique({
            where: { id: parsedJobId },
            select: {
                id: true,
                title: true,
                description: true,
                skills: true,
                status: true,
            },
        });

        if (!targetJob) {
            throw new Error("Job not found");
        }

        requiredSkills = toSkillArray(targetJob.skills);

        const currentSkillSet = new Set(
            currentSkills.map(normalizeSkill)
        );

        matchedSkills = requiredSkills.filter((skill) =>
            currentSkillSet.has(normalizeSkill(skill))
        );

        missingSkills = requiredSkills.filter(
            (skill) => !currentSkillSet.has(normalizeSkill(skill))
        );

        const savedMatch = await prisma.resumeJobMatch.findUnique({
            where: {
                resumeId_jobId: {
                    resumeId: resume.id,
                    jobId: targetJob.id,
                },
            },
            select: {
                recommendations: true,
            },
        });

        recommendations = toSkillArray(savedMatch?.recommendations);
    }

    return {
        resume: {
            id: resume.id,
            fileName: resume.fileName,
        },
        targetJob: targetJob
            ? {
                id: targetJob.id,
                title: targetJob.title,
            }
            : null,
        currentSkills,
        ...(requiredSkills !== undefined ? { requiredSkills } : {}),
        ...(matchedSkills !== undefined ? { matchedSkills } : {}),
        missingSkills,
        recommendations,
    };
};

// Backwards-compatible service for existing callers.
const getSkillGapService = async ({ userId, jobId }) => {
    const data = await getSkillGapBaseData({ userId, jobId });

    const learningRoadmap = await generateLearningRoadmap({
        missingSkills: data.missingSkills,
        targetJobTitle:
            data.targetJob?.title ?? "General career development",
    });

    return {
        ...data,
        learningRoadmap,
    };
};

module.exports = {
    getSkillGapService,
    getSkillGapBaseData,
    generateLearningRoadmap,
};
