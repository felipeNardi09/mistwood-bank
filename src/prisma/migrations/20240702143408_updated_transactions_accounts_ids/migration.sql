/*
  Warnings:

  - You are about to drop the column `accountId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `fromAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_destinationAccountId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "accountId",
ADD COLUMN     "fromAccountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
