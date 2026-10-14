const { ai, MODEL } = require("../ai/orchestrator/geminiClient");
const {
    validateCareerRecommendations,
} = require("./careerGuidance.responseValidation");
const prisma = require("../prisma");

// ========================================
// GET CANDIDATE CONTEXT
// ========================================

async function getCareerGuidanceContext(userId) {
    if (!userId) {
        const error = new Error("Authenticated userId is required");
        error.statusCode = 401;
        throw error;
    }

    const profile = await prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
            experiences: {
                orderBy: { startDate: "desc" },
            },
            educations: {
                orderBy: { startDate: "desc" },
            },
            candidateSkills: {
                include: {
                    skill: {
                        select: { name: true },
                    },
                },
            },
            resumes: {
                where: { isDefault: true },
                take: 1,
                include: {
                    analyses: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            },
        },
    });

    if (!profile) {
        const error = new Error(
            "Please complete your candidate profile first."
        );
        error.statusCode = 404;
        throw error;
    }

    const defaultResume = profile.resumes[0] ?? null;
    const latestAnalysis = defaultResume?.analyses[0] ?? null;

    return {
        profile: {
            headline: profile.headline,
            summary: profile.summary,
            location: profile.location,
            preferredRoles: profile.preferredRoles,
            preferredLocations: profile.preferredLocations,
            preferredJobTypes: profile.preferredJobTypes,

            experiences: profile.experiences.map((item) => ({
                jobTitle: item.jobTitle,
                companyName: item.companyName,
                description: item.description,
                isCurrent: item.isCurrent,
                startDate: item.startDate,
                endDate: item.endDate,
            })),

            educations: profile.educations.map((item) => ({
                degree: item.degree,
                fieldOfStudy: item.fieldOfStudy,
                institution: item.institution,
                description: item.description,
            })),

            skills: profile.candidateSkills.map((item) => ({
                name: item.skill.name,
                proficiency: item.proficiency,
                yearsOfExperience: item.yearsOfExperience,
            })),
        },

        resume: defaultResume
            ? {
                fileName: defaultResume.fileName,
                status: defaultResume.status,
                analysis: latestAnalysis
                    ? {
                        summary: latestAnalysis.summary,
                        skills: latestAnalysis.skills,
                        strengths: latestAnalysis.strengths,
                        weaknesses: latestAnalysis.weaknesses,
                        suggestions: latestAnalysis.suggestions,
                    }
                    : null,
            }
            : null,
    };
}

// ========================================
// PARSE GEMINI JSON RESPONSE
// ========================================

function parseCareerRecommendations(responseText) {
    if (typeof responseText !== "string" || !responseText.trim()) {
        const error = new Error(
            "Gemini returned an empty career recommendation."
        );
        error.statusCode = 502;
        throw error;
    }

    let cleanedText = responseText.trim();

    // Remove Markdown fences if the model unexpectedly returns them.
    cleanedText = cleanedText
        .replace(/^```(?: json) ?\s */i, "")
        .replace(/\s*```$/i, "")
    .trim();

try {
    const parsed = JSON.parse(cleanedText);

    if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
    ) {
        throw new Error("Response must be a JSON object.");
    }

    return parsed;
} catch (parseError) {
    console.error(
        "Career guidance JSON parsing failed:",
        parseError.message
    );

    // Keep diagnostic output limited; do not log candidate context.
    console.error(
        "Gemini response preview:",
        cleanedText.slice(0, 1500)
    );

    const error = new Error(
        "AI returned an invalid response. Please try again."
    );
    error.statusCode = 502;
    throw error;
}
}

// ========================================
// GENERATE CAREER RECOMMENDATIONS
// ========================================

async function generateCareerRecommendations(context, assessment) {
    const prompt = `
You are an expert career guidance assistant.

Create a personalized career roadmap using the candidate data
and assessment below.

RULES:
- Prioritize the user's stated career goal.
- Consider interests and preferred work style.
- Compare profile information with resume analysis.
- Explicitly identify conflicting career information.
- Do not invent skills, qualifications, or work experience.
- Distinguish known facts from assumptions.
- If experience data is missing, state that the current level
  cannot be confirmed instead of inventing seniority.
- Recommend practical learning tasks and projects.
- Do not guarantee employment or promotions.
- Use only technologies supported by the candidate context
  or clearly presented as recommended learning topics.
- Return valid JSON only. No Markdown fences or extra commentary.

CANDIDATE CONTEXT:
${JSON.stringify(context, null, 2)}

CAREER ASSESSMENT:
${JSON.stringify(assessment, null, 2)}

Return a JSON object with exactly this structure:
{
  "careerPath": "string",
  "currentLevel": "string",
  "targetRole": "string",
  "profileMismatch": {
    "detected": false,
    "details": []
  },
  "summary": "string",
  "skillGaps": [
    {
      "skill": "string",
      "priority": "HIGH",
      "reason": "string",
      "learningAction": "string"
    }
  ],
  "roadmap": [
    {
      "phase": "string",
      "duration": "string",
      "focus": "string",
      "tasks": ["string"],
      "completionCriteria": ["string"]
    }
  ],
  "recommendedProjects": [
    {
      "title": "string",
      "description": "string",
      "skillsPracticed": ["string"]
    }
  ],
  "nextActions": ["string"]
}

Requirements:
- profileMismatch.detected must be a boolean.
- profileMismatch.details must be an array of strings.
- Use HIGH, MEDIUM, or LOW for each skill-gap priority.
- Provide practical skill gaps, roadmap phases, projects, and next actions.
- Do not include Markdown or text outside the JSON object.
`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const recommendations = parseCareerRecommendations(response.text);

        // Validate the complete AI response structure.
        const validation =
            validateCareerRecommendations(recommendations);

        if (!validation.isValid) {
            console.error(
                "Invalid Gemini career response:",
                validation.errors
            );

            const error = new Error(
                "AI returned an incomplete career recommendation. Please try again."
            );
            error.statusCode = 502;
            throw error;
        }

        return recommendations;
    } catch (error) {
        console.error(
            "Career recommendation generation failed:",
            error.message
        );

        // Preserve known parsing and validation errors.
        if (error.statusCode) {
            throw error;
        }

        // Avoid exposing internal provider errors to the client.
        const apiError = new Error(
            "Career guidance is temporarily unavailable. Please try again later."
        );
        apiError.statusCode = 502;
        throw apiError;
    }
}

module.exports = {
    getCareerGuidanceContext,
    generateCareerRecommendations,
};
