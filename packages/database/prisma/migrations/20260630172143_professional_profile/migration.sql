-- CreateTable
CREATE TABLE "ProfessionalProfile" (
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "linkedIn" TEXT,
    "website" TEXT,
    "availability" TEXT,
    "sectors" TEXT[],
    "expertiseAreas" TEXT[],
    "qualifications" TEXT[],
    "boardExperience" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
