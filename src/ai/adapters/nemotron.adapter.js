const {
    nemotronClient,
    NEMOTRON_MODEL,
} = require("../../nemotronClient");

const {
    buildResumeAnalysisPrompt,
    validateResumeText,
    parseAnalysisJson,
} = require("../resume-analysis.schema");

async function analyzeResume({ resumeText }) {
    validateResumeText(resumeText);

    const response = await nemotronClient.chat.completions.create({
        model: NEMOTRON_MODEL,
        messages: [
            {
                role: "system",
                content:
                    "You are an expert ATS resume analyzer. " +
                    "Return valid JSON matching the requested structure. " +
                    "Never invent facts not present in the resume.",
            },
            {
                role: "user",
                content: buildResumeAnalysisPrompt(resumeText),
            },
        ],
        response_format: {
            type: "json_object",
        },
        temperature: 0.1,
    });

    const content = response.choices?.[0]?.message?.content;
    const analysis = parseAnalysisJson(content, "Nemotron");

    return {
        analysis,
        usage: {
            inputTokens: response.usage?.prompt_tokens ?? null,
            outputTokens: response.usage?.completion_tokens ?? null,
            totalTokens: response.usage?.total_tokens ?? null,
        },
        model: NEMOTRON_MODEL,
        provider: "nemotron",
    };
}

module.exports = {
    analyzeResume,
};