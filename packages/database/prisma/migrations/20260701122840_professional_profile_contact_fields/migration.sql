-- AlterTable
ALTER TABLE "ProfessionalProfile" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "professionalEmail" TEXT,
ADD COLUMN     "profileVisibility" TEXT NOT NULL DEFAULT 'members',
ADD COLUMN     "showEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showLinkedIn" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twitterX" TEXT;
