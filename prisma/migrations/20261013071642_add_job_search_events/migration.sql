-- CreateTable
CREATE TABLE "JobSearchEvent" (
    "id" SERIAL NOT NULL,
    "keyword" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobSearchEvent_keyword_createdAt_idx" ON "JobSearchEvent"("keyword", "createdAt");

-- CreateIndex
CREATE INDEX "JobSearchEvent_createdAt_idx" ON "JobSearchEvent"("createdAt");
