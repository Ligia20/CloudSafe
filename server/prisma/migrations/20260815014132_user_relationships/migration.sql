/*
  Warnings:

  - Added the required column `userId` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Recent-Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Recent_Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Recent-Alert" ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Recent_Logs" ADD COLUMN     "userId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE INDEX "Recent-Alert_userId_idx" ON "Recent-Alert"("userId");

-- CreateIndex
CREATE INDEX "Recent_Logs_userId_idx" ON "Recent_Logs"("userId");

-- AddForeignKey
ALTER TABLE "Recent_Logs" ADD CONSTRAINT "Recent_Logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recent-Alert" ADD CONSTRAINT "Recent-Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
