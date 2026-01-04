-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "branch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "deliverymen" ADD COLUMN     "branch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "branch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "regions" ADD COLUMN     "branch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "work_shifts" ADD COLUMN     "branch" TEXT NOT NULL DEFAULT '';
