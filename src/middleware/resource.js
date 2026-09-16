const prisma = require("../prisma");

const loadJob = async (req, res, next) => {

    try {

        const job = await prisma.job.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        if (!job) {
            const err = new Error("Job not found");
            err.statusCode = 404;
            return next(err);
        }

        req.resource = job;

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = {
    loadJob
};