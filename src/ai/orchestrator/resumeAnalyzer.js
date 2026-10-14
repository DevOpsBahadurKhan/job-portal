const { nemotronClient, NEMOTRON_MODEL } = require("./nemotronClient");

const RESUME_ANALYSIS_SCHEMA = {
    type: "OBJECT",
    properties: {
        overallScore: {
            type: "INTEGER",
            description: "Overall resume quality score from 0 to 100",
        },
        atsScore: {
            type: "INTEGER",
            description: "ATS compatibility score from 0 to 100",
        },
        summary: {
            type: "STRING",
            description: "Short professional summary of the resume",
        },
        strengths: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
        weaknesses: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
        suggestions: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
        skills: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
        missingSkills: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
        keywords: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
        missingKeywords: {
            type: "ARRAY",
            items: { type: "STRING" },
        },
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



const analyzeResume = async (resumeText) => {
    if (typeof resumeText !== "string" || !resumeText.trim()) {
        throw new Error("Resume text is required");
    }

    const promptText = `
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

Important rules:
- Analyze only information present in the resume.
- Do not invent experience, skills, education, projects, companies or achievements.
- Missing information should be treated as missing.
- Scores must be between 0 and 100.
- Keep suggestions practical and actionable.
- Identify skills from the actual resume.
- Missing skills should represent useful skills that could improve the candidate's profile based on the roles indicated in the resume.
- Return ONLY valid JSON matching this schema structure:
${JSON.stringify(RESUME_ANALYSIS_SCHEMA, null, 2)}

RESUME:
${resumeText}
`;

    const response = await nemotronClient.chat.completions.create({
        model: NEMOTRON_MODEL,
        messages: [
            {
                role: "system",
                content: "You are an expert ATS resume analyzer. You always respond with valid JSON matching the requested structure.",
            },
            {
                role: "user",
                content: promptText,
            },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
    });

    const responseContent = response.choices?.[0]?.message?.content;

    if (!responseContent) {
        throw new Error("Empty response from Nemotron");
    }

    let analysis;

    try {
        analysis = JSON.parse(responseContent);
    } catch (error) {
        throw new Error("Nemotron returned invalid resume analysis JSON");
    }

    return {
        analysis,
        usage: {
            inputTokens: response.usage?.prompt_tokens ?? null,
            outputTokens: response.usage?.completion_tokens ?? null,
            totalTokens: response.usage?.total_tokens ?? null,
        },
        model: NEMOTRON_MODEL,
    };
};

module.exports = {
    analyzeResume,
};



/*
const { ai, MODEL } = require("./geminiClient");
const { nemotronClient, NEMOTRON_MODEL } = require("./nemotron");

const RESUME_ANALYSIS_SCHEMA = {
    type: "OBJECT",
    properties: {
        overallScore: {
            type: "INTEGER",
            description: "Overall resume quality score from 0 to 100",
        },

        atsScore: {
            type: "INTEGER",
            description: "ATS compatibility score from 0 to 100",
        },

        summary: {
            type: "STRING",
            description: "Short professional summary of the resume",
        },

        strengths: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        weaknesses: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        suggestions: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        skills: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        missingSkills: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        keywords: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        missingKeywords: {
            type: "ARRAY",
            items: {
                type: "STRING",
            },
        },

        experienceAnalysis: {
            type: "OBJECT",
            properties: {
                summary: {
                    type: "STRING",
                },
                strengths: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
                },
                gaps: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
                },
            },
            required: ["summary", "strengths", "gaps"],
        },

        educationAnalysis: {
            type: "OBJECT",
            properties: {
                summary: {
                    type: "STRING",
                },
                strengths: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
                },
                gaps: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
                },
            },
            required: ["summary", "strengths", "gaps"],
        },

        projectsAnalysis: {
            type: "OBJECT",
            properties: {
                summary: {
                    type: "STRING",
                },
                strengths: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
                },
                improvements: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
                },
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

const analyzeResume = async (resumeText) => {
    if (
        typeof resumeText !== "string" ||
        !resumeText.trim()
    ) {
        throw new Error("Resume text is required");
    }

    const response = await ai.models.generateContent({
        model: MODEL,

        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `
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

Important rules:

- Analyze only information present in the resume.
- Do not invent experience, skills, education, projects, companies or achievements.
- Missing information should be treated as missing.
- Scores must be between 0 and 100.
- Keep suggestions practical and actionable.
- Identify skills from the actual resume.
- Missing skills should represent useful skills that could improve the candidate's profile based on the roles indicated in the resume.
- Return only the requested structured JSON.

RESUME:

${resumeText}
`,
                    },
                ],
            },
        ],

        config: {
            responseMimeType: "application/json",
            responseSchema: RESUME_ANALYSIS_SCHEMA,
        },
    });

    if (!response.text) {
        throw new Error("Empty response from Gemini");
    }

    let analysis;

    try {
        analysis = JSON.parse(response.text);
    } catch (error) {
        throw new Error("Gemini returned invalid resume analysis JSON");
    }

    return {
        analysis,
        usage: {
            inputTokens:
                response.usageMetadata?.promptTokenCount ?? null,

            outputTokens:
                response.usageMetadata?.candidatesTokenCount ?? null,

            totalTokens:
                response.usageMetadata?.totalTokenCount ?? null,
        },

        model: MODEL,
    };
};

module.exports = {
    analyzeResume,
};
*/