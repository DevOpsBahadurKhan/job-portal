const { ai, MODEL } = require("../../geminiClient");

const {
    RESUME_ANALYSIS_SCHEMA,
    buildResumeAnalysisPrompt,
    validateResumeText,
    parseAnalysisJson,
} = require("../resume-analysis.schema");

async function analyzeResume({ resumeText }) {
    validateResumeText(resumeText);

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: buildResumeAnalysisPrompt(resumeText),
        config: {
            systemInstruction:
                "You are an expert ATS resume analyzer. " +
                "Analyze only the provided resume and never invent facts.",
            responseMimeType: "application/json",
            responseSchema: RESUME_ANALYSIS_SCHEMA,
            temperature: 0.1,
        },
    });

    const analysis = parseAnalysisJson(response.text, "Gemini");
    const usage = response.usageMetadata;

    return {
        analysis,
        usage: {
            inputTokens: usage?.promptTokenCount ?? null,
            outputTokens: usage?.candidatesTokenCount ?? null,
            totalTokens: usage?.totalTokenCount ?? null,
        },
        model: MODEL,
        provider: "gemini",
    };
}

module.exports = {
    analyzeResume,
};