const {
    applyJobService, getMyApplicationsService
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


const getMyApplications = async (req, res, next) => {
    try {

        const candidateId = req.user.id;

        const applications = await getMyApplicationsService(
            candidateId
        );

        res.status(201).send({
            success: true,
            message: "Applications fetched successfully",
            data: applications
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyJob, getMyApplications
};