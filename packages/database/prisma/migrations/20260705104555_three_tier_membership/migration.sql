-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('PROFESSIONAL', 'STUDENT', 'CORPORATE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "memberType" "MemberType" NOT NULL DEFAULT 'PROFESSIONAL';

-- CreateTable
CREATE TABLE "StudentProfile" (
    "userId" TEXT NOT NULL,
    "university" TEXT,
    "degree" TEXT,
    "graduationYear" INTEGER,
    "studyArea" TEXT,
    "placementAvailable" BOOLEAN NOT NULL DEFAULT true,
    "linkedIn" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "esgInterests" TEXT[],
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "profileVisibility" TEXT NOT NULL DEFAULT 'members',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "CorporateProfile" (
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "companyWebsite" TEXT,
    "sector" TEXT,
    "companySize" TEXT,
    "headquarters" TEXT,
    "description" TEXT,
    "lookingFor" TEXT[],
    "contactName" TEXT,
    "contactRole" TEXT,
    "profileVisibility" TEXT NOT NULL DEFAULT 'members',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateProfile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateProfile" ADD CONSTRAINT "CorporateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
