-- CreateTable
CREATE TABLE "deliverymen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "mainPixKey" TEXT NOT NULL,
    "secondPixKey" TEXT NOT NULL,
    "thridPixKey" TEXT NOT NULL,
    "agency" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "vehicleColor" TEXT NOT NULL,
    "regionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverymen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "deliverymen" ADD CONSTRAINT "deliverymen_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
