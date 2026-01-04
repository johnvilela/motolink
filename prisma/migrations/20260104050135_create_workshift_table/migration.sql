-- CreateTable
CREATE TABLE "work_shifts" (
    "id" TEXT NOT NULL,
    "deliverymanId" TEXT,
    "clientId" TEXT NOT NULL,
    "createdBy" TEXT,
    "isPlanned" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "shiftDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "auditStatus" TEXT NOT NULL,
    "logs" JSONB[],
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_shifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_deliverymanId_fkey" FOREIGN KEY ("deliverymanId") REFERENCES "deliverymen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
