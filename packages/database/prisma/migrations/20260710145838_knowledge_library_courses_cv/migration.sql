-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('DOCUMENT', 'AUDIO', 'VIDEO_EMBED', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CvSubmissionStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ResourceType" NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "filename" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "embedUrl" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "financialFlagged" BOOLEAN NOT NULL DEFAULT false,
    "ipDeclared" BOOLEAN NOT NULL DEFAULT false,
    "hasFinancialDisclaimer" BOOLEAN NOT NULL DEFAULT false,
    "moderatorId" TEXT,
    "moderatorNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceDownload" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "downloaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseListing" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isExternalProvider" BOOLEAN NOT NULL DEFAULT false,
    "externalUrl" TEXT,
    "commissionUrl" TEXT,
    "price" TEXT,
    "deliveryMode" TEXT,
    "startDate" TIMESTAMP(3),
    "sectors" TEXT[],
    "status" "CourseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "notes" TEXT,
    "status" "CvSubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
    "reviewerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resource_status_idx" ON "Resource"("status");

-- CreateIndex
CREATE INDEX "Resource_uploaderId_idx" ON "Resource"("uploaderId");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "ResourceDownload_downloaderId_idx" ON "ResourceDownload"("downloaderId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceDownload_resourceId_downloaderId_key" ON "ResourceDownload"("resourceId", "downloaderId");

-- CreateIndex
CREATE INDEX "CourseListing_status_idx" ON "CourseListing"("status");

-- CreateIndex
CREATE INDEX "CourseListing_providerId_idx" ON "CourseListing"("providerId");

-- CreateIndex
CREATE INDEX "CvSubmission_userId_idx" ON "CvSubmission"("userId");

-- CreateIndex
CREATE INDEX "CvSubmission_status_idx" ON "CvSubmission"("status");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDownload" ADD CONSTRAINT "ResourceDownload_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceDownload" ADD CONSTRAINT "ResourceDownload_downloaderId_fkey" FOREIGN KEY ("downloaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseListing" ADD CONSTRAINT "CourseListing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvSubmission" ADD CONSTRAINT "CvSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
