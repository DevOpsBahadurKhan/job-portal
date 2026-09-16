const {
    createJobService,updateJobService
} = require("../services/job.service");

const createJob = async (req, res, next) => {
    try {

        const job = await createJobService(
            req.body,
            req.user.id
        );

        res.status(201).send({
            success: true,
            message: "Job created successfully",
            data: job
        });

    } catch (error) {
        next(error);
    }
};

const updateJob = async (req, res, next) => {
    try {

        const jobId = Number(req.params.id);

        const job = await updateJobService(
            jobId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Job updated successfully",
            data: job
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createJob, updateJob
};