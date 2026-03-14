-- AlterTable
ALTER TABLE "work_shift_slots" ADD COLUMN     "additionalTax" DECIMAL(16,2) NOT NULL DEFAULT 0,
ADD COLUMN     "additionalTaxReason" TEXT,
ADD COLUMN     "guaranteedDayTax" DECIMAL(16,2) NOT NULL DEFAULT 0,
ADD COLUMN     "guaranteedNightTax" DECIMAL(16,2) NOT NULL DEFAULT 0;
