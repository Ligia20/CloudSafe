-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recent-Alert" DROP CONSTRAINT "Recent-Alert_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recent_Logs" DROP CONSTRAINT "Recent_Logs_userId_fkey";

-- AddForeignKey
ALTER TABLE "Recent_Logs" ADD CONSTRAINT "Recent_Logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recent-Alert" ADD CONSTRAINT "Recent-Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
