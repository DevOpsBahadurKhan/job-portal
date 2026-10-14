const {
    matchResumeWithJob,
} = require("./resume.matching.service");




const {
    uploadResumeService,
    getResumeAnalysis,
    getUserResumes,
    setDefaultResumeService,
    deleteResumeService,

} = require("./resume.service");


const matchResumeWithJobController = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const resumeId = Number(
            req.params.resumeId
        );

        const jobId = Number(
            req.params.jobId
        );

        if (
            !Number.isInteger(resumeId) ||
            !Number.isInteger(jobId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID or job ID",
            });
        }

        const data = await matchResumeWithJob({
            userId,
            resumeId,
            jobId,
        });

        return res.status(200).json({
            success: true,
            message: "Resume matched with job successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};


const deleteResumeController = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const resumeId = Number(req.params.resumeId);

        if (!Number.isInteger(resumeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        const data = await deleteResumeService({
            userId,
            resumeId,
        });

        return res.status(200).json({
            success: true,
            message: "Resume deleted successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};


const setDefaultResumeController = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const resumeId = Number(req.params.resumeId);

        if (!Number.isInteger(resumeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        const data = await setDefaultResumeService({
            userId,
            resumeId,
        });

        return res.status(200).json({
            success: true,
            message: "Default resume updated successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};



const getUserResumesController = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const data = await getUserResumes({
            userId,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};


const getResumeAnalysisController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const resumeId = Number(req.params.resumeId);

        if (!Number.isInteger(resumeId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID",
            });
        }

        const data = await getResumeAnalysis({
            userId,
            resumeId,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};


const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume file is required",
            });
        }

        const result = await uploadResumeService({
            userId: req.user.id,
            file: req.file,
        });

        return res.status(201).json({
            success: true,
            message: "Resume uploaded successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadResume,
    getResumeAnalysisController,
    getUserResumesController,
    setDefaultResumeController,
    deleteResumeController,
    matchResumeWithJobController

};