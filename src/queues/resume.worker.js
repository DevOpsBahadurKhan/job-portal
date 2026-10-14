const { Worker } = require("bullmq");
const prisma = require("../prisma");
const { parseResume } = require("../resume/resume.parser");
const { analyzeResume } = require("../ai/orchestrator/resumeAnalyzer");

const connection = {
    url: process.env.REDIS_URL,
};

const resumeWorker = new Worker(
    "resume-processing",

    async (job) => {
        const { resumeId } = job.data;

        console.log(`Processing resume: ${resumeId}`);

        const resume = await prisma.resume.findUnique({
            where: {
                id: resumeId,
            },
        });

        if (!resume) {
            throw new Error(`Resume not found: ${resumeId}`);
        }

        try {
            // ==========================================
            // 1. Extract resume text
            // ==========================================

            const extractedText = await parseResume({
                originalname: resume.fileName,
                path: resume.fileUrl,
            });

            if (!extractedText?.trim()) {
                throw new Error(
                    "No text could be extracted from resume"
                );
            }

            console.log(
                `Resume ${resumeId}: text extracted`
            );

            // ==========================================
            // 2. Save extracted text
            // ==========================================

            await prisma.resume.update({
                where: {
                    id: resumeId,
                },

                data: {
                    extractedText,
                },
            });

            // ==========================================
            // 3. Analyze resume using Gemini
            // ==========================================

            console.log(
                `Resume ${resumeId}: starting AI analysis`
            );

            const {
                analysis,
                usage,
                model,
            } = await analyzeResume(extractedText);

            console.log(
                `Resume ${resumeId}: AI analysis completed`
            );

            // ==========================================
            // 4. Save AI analysis
            // ==========================================

            const resumeAnalysis =
                await prisma.resumeAnalysis.create({
                    data: {
                        resumeId,

                        overallScore:
                            analysis.overallScore,

                        atsScore:
                            analysis.atsScore,

                        summary:
                            analysis.summary,

                        strengths:
                            analysis.strengths,

                        weaknesses:
                            analysis.weaknesses,

                        suggestions:
                            analysis.suggestions,

                        skills:
                            analysis.skills,

                        missingSkills:
                            analysis.missingSkills,

                        keywords:
                            analysis.keywords,

                        missingKeywords:
                            analysis.missingKeywords,

                        experienceAnalysis:
                            analysis.experienceAnalysis,

                        educationAnalysis:
                            analysis.educationAnalysis,

                        projectsAnalysis:
                            analysis.projectsAnalysis,

                        aiModel:
                            model,

                        inputTokens:
                            usage.inputTokens,

                        outputTokens:
                            usage.outputTokens,

                        totalTokens:
                            usage.totalTokens,
                    },
                });

            // ==========================================
            // 5. Mark resume as completed
            // ==========================================

            const updatedResume =
                await prisma.resume.update({
                    where: {
                        id: resumeId,
                    },

                    data: {
                        status: "COMPLETED",
                    },
                });

            console.log(
                `Resume ${resumeId} processed successfully`
            );

            return {
                resumeId: updatedResume.id,
                status: updatedResume.status,
                analysisId: resumeAnalysis.id,
                overallScore:
                    resumeAnalysis.overallScore,
                atsScore:
                    resumeAnalysis.atsScore,
            };
        } catch (error) {
            // ==========================================
            // 6. Mark resume as failed
            // ==========================================

            await prisma.resume.update({
                where: {
                    id: resumeId,
                },

                data: {
                    status: "FAILED",
                },
            });

            console.error(
                `Resume ${resumeId} processing failed:`,
                error.message
            );

            throw error;
        }
    },

    {
        connection,

        concurrency: 2,
    }
);

// ==========================================
// Worker Events
// ==========================================

resumeWorker.on("completed", (job) => {
    console.log(
        `Resume job completed: ${job.id}`,
        job.returnvalue
    );
});

resumeWorker.on("failed", (job, error) => {
    console.error(
        `Resume job failed: ${job?.id}`,
        error.message
    );
});

resumeWorker.on("error", (error) => {
    console.error(
        "Resume worker error:",
        error.message
    );
});

module.exports = resumeWorker;