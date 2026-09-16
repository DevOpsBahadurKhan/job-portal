
module.exports = (error, req, res, next) => {

    let status = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    let data = error.data || null;
    let validation = error.validation || null;

    // Prisma unique constraint error
    if (error.code === "P2002") {
        status = 409;
        message = "Email already exists";
    }

    res.status(status).json({
        success: false,
        message,
        data,
        validation
    });
};

