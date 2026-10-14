-- CreateEnum
CREATE TYPE "UsageFeature" AS ENUM ('AI_ASSISTANT', 'RESUME_ANALYSIS', 'SKILL_GAP_ANALYSIS', 'CAREER_GUIDANCE');

-- CreateEnum
CREATE TYPE "PlanAudience" AS ENUM ('CANDIDATE', 'RECRUITER', 'BOTH');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "maxAiMessages" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "maxCareerGuidance" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxResumeAnalyses" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "maxSkillGapAnalyses" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "targetAudience" "PlanAudience" NOT NULL DEFAULT 'BOTH';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "feature" "UsageFeature" NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsageRecord_userId_periodEnd_idx" ON "UsageRecord"("userId", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "UsageRecord_userId_feature_periodStart_key" ON "UsageRecord"("userId", "feature", "periodStart");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
