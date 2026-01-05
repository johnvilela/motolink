/*
  Warnings:

  - You are about to drop the column `paymentForm` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `periods` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "paymentForm",
DROP COLUMN "periods";

-- CreateTable
CREATE TABLE "commercial_conditions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paymentForm" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentTermDays" INTEGER DEFAULT 0,
    "deliveryAreaKm" DOUBLE PRECISION DEFAULT 0,
    "isMotolinkCovered" BOOLEAN DEFAULT false,
    "guaranteedDay" INTEGER DEFAULT 0,
    "guaranteedDayWeekend" INTEGER DEFAULT 0,
    "guaranteedNight" INTEGER DEFAULT 0,
    "guaranteedNightWeekend" INTEGER DEFAULT 0,
    "clientDailyDay" DECIMAL(16,2) DEFAULT 0,
    "clientDailyDayWknd" DECIMAL(16,2) DEFAULT 0,
    "clientDailyNight" DECIMAL(16,2) DEFAULT 0,
    "clientDailyNightWknd" DECIMAL(16,2) DEFAULT 0,
    "clientPerDelivery" DECIMAL(16,2) DEFAULT 0,
    "clientAdditionalKm" DECIMAL(16,2) DEFAULT 0,
    "courierDailyDay" DECIMAL(16,2) DEFAULT 0,
    "courierDailyDayWknd" DECIMAL(16,2) DEFAULT 0,
    "courierDailyNight" DECIMAL(16,2) DEFAULT 0,
    "courierDailyNightWknd" DECIMAL(16,2) DEFAULT 0,
    "courierPerDelivery" DECIMAL(16,2) DEFAULT 0,
    "courierAdditionalKm" DECIMAL(16,2) DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commercial_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_conditions_clientId_key" ON "commercial_conditions"("clientId");

-- AddForeignKey
ALTER TABLE "commercial_conditions" ADD CONSTRAINT "commercial_conditions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
