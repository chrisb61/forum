-- CreateEnum
CREATE TYPE "ResourceRights" AS ENUM ('READ_ONLY', 'DOWNLOAD', 'SHARE', 'OPEN');

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "rights" "ResourceRights" NOT NULL DEFAULT 'DOWNLOAD';
