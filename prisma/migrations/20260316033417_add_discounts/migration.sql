-- AlterTable
ALTER TABLE "work_shift_slots" ADD COLUMN     "rainTax" DECIMAL(16,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "workShiftSlotId" TEXT NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discounts_workShiftSlotId_idx" ON "discounts"("workShiftSlotId");

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_workShiftSlotId_fkey" FOREIGN KEY ("workShiftSlotId") REFERENCES "work_shift_slots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
