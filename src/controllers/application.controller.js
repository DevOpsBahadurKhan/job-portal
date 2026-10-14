const {
    applyJobService,
    getMyApplicationsService,
    getRecruiterApplicationsService,
    updateRecruiterApplicationStatusService
} = require("../services/application.service");


const applyJob = async (req, res, next) => {
    try {
        const jobId = Number(req.params.jobId);
        console.log(req.file);

        const applicationData = {
            ...req.body,
            resumeUrl: req.file
                ? `/uploads/resumes/${req.file.filename}`
                : null
        };

        const application = await applyJobService(
            jobId,
            req.user.id,
            applicationData
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



const getRecruiterApplications = async (req, res, next) => {
    try {
        if (req.user.role !== "RECRUITER" ) {
            const error = new Error(
                "Only recruiters can view received applications"
            );
            error.statusCode = 403;
            throw error;
        }

        const applications =
            await getRecruiterApplicationsService(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Recruiter applications fetched successfully",
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};


const updateRecruiterApplicationStatus = async (req, res, next) => {
    try {
        if (req.user.role !== "RECRUITER") {
            const error = new Error(
                "Only recruiters can update application status"
            );
            error.statusCode = 403;
            throw error;
        }

        const applicationId = Number(req.params.applicationId);
        const { status } = req.body;

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            const error = new Error("Invalid application ID");
            error.statusCode = 400;
            throw error;
        }

        const application =
            await updateRecruiterApplicationStatusService(
                applicationId,
                req.user.id,
                status
            );

        return res.status(200).json({
            success: true,
            message: "Application status updated successfully",
            data: application,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    applyJob,
    getRecruiterApplications,
    getMyApplications,
    updateRecruiterApplicationStatus
};