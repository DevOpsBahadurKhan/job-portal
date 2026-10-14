//nemotronClient.js

const OpenAI = require("openai");

const nemotronClient = new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY,
});

const NEMOTRON_MODEL =
    process.env.NEMOTRON_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

module.exports = {
    nemotronClient,
    NEMOTRON_MODEL,
};
