/*
  Warnings:

  - You are about to drop the column `fromAccountId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_fromAccountId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "fromAccountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
