const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.uploadFolder || "documents";

        const uploadPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            folder
        );

        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `${Date.now()}-${require("crypto").randomUUID()}${ext}`;

        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = req.allowedMimeTypes || [];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("File type not allowed"));
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = upload;