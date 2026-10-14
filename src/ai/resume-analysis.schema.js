// src/ai/resume-analysis.schema.js

const RESUME_ANALYSIS_SCHEMA = {
    type: "OBJECT",
    properties: {
        overallScore: { type: "INTEGER" },
        atsScore: { type: "INTEGER" },
        summary: { type: "STRING" },
        strengths: { type: "ARRAY", items: { type: "STRING" } },
        weaknesses: { type: "ARRAY", items: { type: "STRING" } },
        suggestions: { type: "ARRAY", items: { type: "STRING" } },
        skills: { type: "ARRAY", items: { type: "STRING" } },
        missingSkills: { type: "ARRAY", items: { type: "STRING" } },
        keywords: { type: "ARRAY", items: { type: "STRING" } },
        missingKeywords: { type: "ARRAY", items: { type: "STRING" } },

        experienceAnalysis: {
            type: "OBJECT",
            properties: {
                summary: { type: "STRING" },
                strengths: { type: "ARRAY", items: { type: "STRING" } },
                gaps: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["summary", "strengths", "gaps"],
        },

        educationAnalysis: {
            type: "OBJECT",
            properties: {
                summary: { type: "STRING" },
                strengths: { type: "ARRAY", items: { type: "STRING" } },
                gaps: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["summary", "strengths", "gaps"],
        },

        projectsAnalysis: {
            type: "OBJECT",
            properties: {
                summary: { type: "STRING" },
                strengths: { type: "ARRAY", items: { type: "STRING" } },
                improvements: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["summary", "strengths", "improvements"],
        },
    },

    required: [
        "overallScore",
        "atsScore",
        "summary",
        "strengths",
        "weaknesses",
        "suggestions",
        "skills",
        "missingSkills",
        "keywords",
        "missingKeywords",
        "experienceAnalysis",
        "educationAnalysis",
        "projectsAnalysis",
    ],
};

function buildResumeAnalysisPrompt(resumeText) {
    return `
Analyze the following resume as a professional ATS and resume analyzer.

Evaluate:
1. Overall resume quality
2. ATS compatibility
3. Technical and professional skills
4. Missing or weak skills
5. Important keywords
6. Missing keywords
7. Work experience
8. Education
9. Projects
10. Actionable improvement suggestions

Rules:
- Analyze only information present in the resume.
- Never invent experience, skills, education, projects, companies or achievements.
- Treat missing information as missing.
- Scores must be integers between 0 and 100.
- Keep suggestions practical and actionable.
- Identify skills from the actual resume.
- Missing skills should be relevant to roles indicated in the resume.
- Return only valid JSON matching this structure:

${JSON.stringify(RESUME_ANALYSIS_SCHEMA, null, 2)}

RESUME:
${resumeText}
`;
}

function validateResumeText(resumeText) {
    if (typeof resumeText !== "string" || !resumeText.trim()) {
        throw new Error("Resume text is required");
    }
}

function parseAnalysisJson(content, provider) {
    if (!content || typeof content !== "string") {
        throw new Error(`Empty response from ${provider}`);
    }

    let analysis;

    try {
        analysis = JSON.parse(content);
    } catch {
        throw new Error(`${provider} returned invalid resume analysis JSON`);
    }

    if (
        !analysis ||
        typeof analysis !== "object" ||
        Array.isArray(analysis)
    ) {
        throw new Error(`${provider} returned an invalid analysis object`);
    }

    return analysis;
}

module.exports = {
    RESUME_ANALYSIS_SCHEMA,
    buildResumeAnalysisPrompt,
    validateResumeText,
    parseAnalysisJson,
};