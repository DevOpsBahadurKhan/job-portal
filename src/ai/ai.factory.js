const geminiAdapter = require("./adapters/gemini.adapter");
const nemotronAdapter = require("./adapters/nemotron.adapter");

const AI_PROVIDERS = Object.freeze({
    gemini: geminiAdapter,
    nemotron: nemotronAdapter,
});

function getAIAdapter(model = process.env.DEFAULT_AI_MODEL || "gemini") {
    if (typeof model !== "string") {
        throw new Error("AI model must be a string");
    }

    const normalizedModel = model.trim().toLowerCase();
    const adapter = AI_PROVIDERS[normalizedModel];

    if (!adapter) {
        throw new Error(`Unsupported AI model: ${normalizedModel}`);
    }

    return adapter;
}

module.exports = {
    getAIAdapter,
};