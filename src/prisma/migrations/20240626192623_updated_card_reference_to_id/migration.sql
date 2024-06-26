-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_accountId_fkey";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
