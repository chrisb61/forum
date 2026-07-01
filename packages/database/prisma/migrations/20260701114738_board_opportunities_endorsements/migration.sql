-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('NED', 'CHAIR', 'ADVISORY_BOARD', 'COMMITTEE', 'TRUSTEE', 'FRACTIONAL_EXECUTIVE', 'INVESTOR', 'MENTOR');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED');

-- CreateEnum
CREATE TYPE "EndorsementSkill" AS ENUM ('GOVERNANCE', 'STRATEGIC_THINKING', 'LEADERSHIP', 'ESG_KNOWLEDGE', 'DIGITAL_EXPERTISE', 'FINANCIAL_EXPERTISE', 'RISK_MANAGEMENT', 'STAKEHOLDER_ENGAGEMENT', 'TRANSFORMATION', 'INVESTOR_RELATIONS');

-- CreateTable
CREATE TABLE "BoardOpportunity" (
    "id" TEXT NOT NULL,
    "postedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "sectors" TEXT[],
    "location" TEXT,
    "remuneration" TEXT,
    "timeCommitment" TEXT,
    "closingDate" TIMESTAMP(3),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunityExpression" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityExpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL,
    "endorserId" TEXT NOT NULL,
    "endorseeId" TEXT NOT NULL,
    "skill" "EndorsementSkill" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardOpportunity_postedById_idx" ON "BoardOpportunity"("postedById");

-- CreateIndex
CREATE INDEX "BoardOpportunity_status_idx" ON "BoardOpportunity"("status");

-- CreateIndex
CREATE INDEX "BoardOpportunity_type_idx" ON "BoardOpportunity"("type");

-- CreateIndex
CREATE INDEX "BoardOpportunity_createdAt_idx" ON "BoardOpportunity"("createdAt");

-- CreateIndex
CREATE INDEX "OpportunityExpression_opportunityId_idx" ON "OpportunityExpression"("opportunityId");

-- CreateIndex
CREATE INDEX "OpportunityExpression_userId_idx" ON "OpportunityExpression"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityExpression_opportunityId_userId_key" ON "OpportunityExpression"("opportunityId", "userId");

-- CreateIndex
CREATE INDEX "Endorsement_endorseeId_idx" ON "Endorsement"("endorseeId");

-- CreateIndex
CREATE INDEX "Endorsement_endorserId_idx" ON "Endorsement"("endorserId");

-- CreateIndex
CREATE UNIQUE INDEX "Endorsement_endorserId_endorseeId_skill_key" ON "Endorsement"("endorserId", "endorseeId", "skill");

-- AddForeignKey
ALTER TABLE "BoardOpportunity" ADD CONSTRAINT "BoardOpportunity_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityExpression" ADD CONSTRAINT "OpportunityExpression_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "BoardOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityExpression" ADD CONSTRAINT "OpportunityExpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorserId_fkey" FOREIGN KEY ("endorserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorseeId_fkey" FOREIGN KEY ("endorseeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
