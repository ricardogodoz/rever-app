/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `FinancialEntry` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FinancialEntry` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FinancialEntry_status_idx";

-- AlterTable
ALTER TABLE "FinancialEntry" DROP COLUMN "paymentDate",
DROP COLUMN "status",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "settledAt" TIMESTAMP(3),
ALTER COLUMN "bankAccountId" DROP NOT NULL;

-- DropEnum
DROP TYPE "FinancialEntryStatus";

-- CreateIndex
CREATE INDEX "FinancialEntry_settledAt_idx" ON "FinancialEntry"("settledAt");

-- CreateIndex
CREATE INDEX "FinancialEntry_cancelledAt_idx" ON "FinancialEntry"("cancelledAt");
