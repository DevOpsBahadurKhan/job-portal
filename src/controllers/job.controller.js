const {
    createJobService,
    updateJobService,
    deleteJobService,
    listJobService,
    getJobByIdService
} = require("../services/job.service");

const createJob = async (req, res, next) => {
    try {

        
      const id = Number(req.user.id)
        const job = await createJobService(
            req.body,
            id,
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


const deleteJob = async (req, res, next) => {
    try {
        const jobId = Number(req.params.id);
        const job = await deleteJobService(jobId);

        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
            data: job
        });

    } catch (error) {
        next(error)
    }
}


const listJob = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            location,
            jobType,
            salaryMin
        } = req.query;

        const result = await listJobService({
            page,
            limit,
            search,
            location,
            jobType,
            salaryMin
        });

        res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: result.jobs,
            pagination: result.pagination
        });


    } catch (error) {
        next(error)
    }
}

const getJobById= async (req, res, next) => {
    try {
        const jobId = Number(req.params.id);
        const job = await getJobByIdService(jobId);

        res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job,

        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    createJob, updateJob, deleteJob, listJob, getJobById
};