/*
  Warnings:

  - You are about to drop the column `isFreelancer` on the `work_shift_slots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "startHour" SET DATA TYPE TIME(3),
ALTER COLUMN "endHour" SET DATA TYPE TIME(3);

-- AlterTable
ALTER TABLE "plannings" ALTER COLUMN "plannedDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "work_shift_slots" DROP COLUMN "isFreelancer",
ALTER COLUMN "shiftDate" SET DATA TYPE DATE,
ALTER COLUMN "startTime" SET DATA TYPE TIME(3),
ALTER COLUMN "endTime" SET DATA TYPE TIME(3),
ALTER COLUMN "checkInAt" SET DATA TYPE TIME(3),
ALTER COLUMN "checkOutAt" SET DATA TYPE TIME(3);
