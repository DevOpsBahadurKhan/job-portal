
const {
    createInterviewService,
    getApplicationInterviewsService,
    updateInterviewService,
    cancelInterviewService,
} = require("../services/interview.service");

const isValidId = (value) =>
    Number.isInteger(Number(value)) && Number(value) > 0;

const ensureRecruiter = (req) => {
    if (req.user?.role !== "RECRUITER") {
        const error = new Error("Only recruiters can manage interviews");
        error.statusCode = 403;
        throw error;
    }
};

const createInterview = async (req, res, next) => {
    try {
        ensureRecruiter(req);

        const { applicationId } = req.params;

        if (!isValidId(applicationId)) {
            const error = new Error("Invalid application ID");
            error.statusCode = 400;
            throw error;
        }

        const interview = await createInterviewService(
            Number(applicationId),
            req.user.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Interview scheduled successfully",
            data: interview,
        });
    } catch (error) {
        next(error);
    }
};

const getApplicationInterviews = async (req, res, next) => {
    try {
        ensureRecruiter(req);

        const { applicationId } = req.params;

        if (!isValidId(applicationId)) {
            const error = new Error("Invalid application ID");
            error.statusCode = 400;
            throw error;
        }

        const interviews = await getApplicationInterviewsService(
            Number(applicationId),
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Interviews fetched successfully",
            data: interviews,
        });
    } catch (error) {
        next(error);
    }
};

const updateInterview = async (req, res, next) => {
    try {
        ensureRecruiter(req);

        const { interviewId } = req.params;

        if (!isValidId(interviewId)) {
            const error = new Error("Invalid interview ID");
            error.statusCode = 400;
            throw error;
        }

        const interview = await updateInterviewService(
            Number(interviewId),
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Interview updated successfully",
            data: interview,
        });
    } catch (error) {
        next(error);
    }
};

const cancelInterview = async (req, res, next) => {
    try {
        ensureRecruiter(req);

        const { interviewId } = req.params;

        if (!isValidId(interviewId)) {
            const error = new Error("Invalid interview ID");
            error.statusCode = 400;
            throw error;
        }

        const interview = await cancelInterviewService(
            Number(interviewId),
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Interview cancelled successfully",
            data: interview,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInterview,
    getApplicationInterviews,
    updateInterview,
    cancelInterview,
};
