-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "status" "ResumeStatus" NOT NULL DEFAULT 'UPLOADED';

-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "overallScore" INTEGER,
    "atsScore" INTEGER,
    "summary" TEXT,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "suggestions" JSONB,
    "skills" JSONB,
    "missingSkills" JSONB,
    "keywords" JSONB,
    "missingKeywords" JSONB,
    "experienceAnalysis" JSONB,
    "educationAnalysis" JSONB,
    "projectsAnalysis" JSONB,
    "aiModel" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeJobMatch" (
    "id" SERIAL NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "matchScore" INTEGER,
    "matchedSkills" JSONB,
    "missingSkills" JSONB,
    "matchedKeywords" JSONB,
    "missingKeywords" JSONB,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeJobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeAnalysis_resumeId_idx" ON "ResumeAnalysis"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeAnalysis_createdAt_idx" ON "ResumeAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "ResumeJobMatch_resumeId_idx" ON "ResumeJobMatch"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeJobMatch_jobId_idx" ON "ResumeJobMatch"("jobId");

-- CreateIndex
CREATE INDEX "ResumeJobMatch_matchScore_idx" ON "ResumeJobMatch"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeJobMatch_resumeId_jobId_key" ON "ResumeJobMatch"("resumeId", "jobId");

-- CreateIndex
CREATE INDEX "Resume_status_idx" ON "Resume"("status");

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeJobMatch" ADD CONSTRAINT "ResumeJobMatch_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeJobMatch" ADD CONSTRAINT "ResumeJobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
