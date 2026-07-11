-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "availableFrom" TEXT,
ADD COLUMN     "dissertationTopic" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "talentVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "TalentExpression" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "corporateId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TalentExpression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TalentExpression_studentId_idx" ON "TalentExpression"("studentId");

-- CreateIndex
CREATE INDEX "TalentExpression_corporateId_idx" ON "TalentExpression"("corporateId");

-- CreateIndex
CREATE UNIQUE INDEX "TalentExpression_studentId_corporateId_key" ON "TalentExpression"("studentId", "corporateId");

-- AddForeignKey
ALTER TABLE "TalentExpression" ADD CONSTRAINT "TalentExpression_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TalentExpression" ADD CONSTRAINT "TalentExpression_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
