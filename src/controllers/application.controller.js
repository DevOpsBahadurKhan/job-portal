const {
    applyJobService
} = require("../services/application.service");

const applyJob = async (req, res, next) => {
    try {

        const jobId = Number(req.params.jobId);

        const application = await applyJobService(
            jobId,
            req.user.id,
            req.body
        );

        res.status(201).send({
            success: true,
            message: "Application submitted successfully",
            data: application
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyJob
};