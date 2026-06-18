-- AlterTable
ALTER TABLE "Routine"
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "frequency" TEXT NOT NULL DEFAULT 'daily',
ADD COLUMN     "question" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "scheduledTime" TEXT NOT NULL DEFAULT '08:00';
