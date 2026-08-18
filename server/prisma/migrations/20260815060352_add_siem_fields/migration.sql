/*
  Warnings:

  - Added the required column `organizationId` to the `Asset` table.
  - Added the required column `organizationId` to the `User` table.
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- CreateTable
CREATE TABLE "Org" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);


-- Create default organization
INSERT INTO "Org" ("name")
VALUES ('Default Organization');


-- AlterTable
ALTER TABLE "Asset"
ADD COLUMN "organizationId" UUID;


-- Assign existing assets
UPDATE "Asset"
SET "organizationId" = (
    SELECT "id"
    FROM "Org"
    LIMIT 1
);


-- Make Asset organization required
ALTER TABLE "Asset"
ALTER COLUMN "organizationId" SET NOT NULL;


-- AlterTable
ALTER TABLE "User"
ADD COLUMN "organizationId" UUID;


-- Assign existing users
UPDATE "User"
SET "organizationId" = (
    SELECT "id"
    FROM "Org"
    LIMIT 1
);


-- Make User organization required
ALTER TABLE "User"
ALTER COLUMN "organizationId" SET NOT NULL;


-- AlterTable
ALTER TABLE "Recent_Logs"
ADD COLUMN "category" TEXT,
ADD COLUMN "rawData" JSONB,
ADD COLUMN "riskLevel" TEXT,
ADD COLUMN "riskScore" INTEGER;


-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assetId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "sourceIp" TEXT,
    "eventType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);


-- AddForeignKey
ALTER TABLE "Asset"
ADD CONSTRAINT "Asset_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Org"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Org"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "Event"
ADD CONSTRAINT "Event_assetId_fkey"
FOREIGN KEY ("assetId")
REFERENCES "Asset"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "Event"
ADD CONSTRAINT "Event_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Org"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;