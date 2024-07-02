/*
  Warnings:

  - You are about to drop the column `accountId` on the `Account` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Account_accountId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "accountId";
