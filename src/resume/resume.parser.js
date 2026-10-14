const path = require("path");

const {
    extractTextFromPdf,
} = require("../utils/resume/pdf.parser");

const {
    cleanText,
} = require("../utils/resume/text.cleaner");

const parseResume = async (file) => {
    const extension = path.extname(file.originalname).toLowerCase();

    let extractedText;

    switch (extension) {
        case ".pdf":
            extractedText = await extractTextFromPdf(file.path);
            break;

        default:
            throw new Error(
                `Unsupported resume format: ${extension}`
            );
    }

    return cleanText(extractedText);
};

module.exports = {
    parseResume,
};