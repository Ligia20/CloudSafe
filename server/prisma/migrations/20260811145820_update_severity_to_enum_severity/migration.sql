/*
  Warnings:

  - Added the required column `severity` to the `Recent-Alert ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `Recent-Logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Recent-Alert " DROP COLUMN "severity",
ADD COLUMN     "severity" "Severity" NOT NULL;

-- AlterTable
ALTER TABLE "Recent-Logs" DROP COLUMN "severity",
ADD COLUMN     "severity" "Severity" NOT NULL;
