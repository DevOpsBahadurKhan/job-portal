const fs = require("fs/promises");
const { PDFParse } = require("pdf-parse");

const extractTextFromPdf = async (filePath) => {
    const buffer = await fs.readFile(filePath);

    const parser = new PDFParse({
        data: buffer,
    });

    try {
        const result = await parser.getText();

        return result.text;
    } finally {
        await parser.destroy();
    }
};

module.exports = {
    extractTextFromPdf,
};