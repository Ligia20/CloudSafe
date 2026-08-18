/*
  Migration: add organizationId to Recent-Alert and Recent_Logs
*/

-- Add columns temporarily nullable
ALTER TABLE "Recent-Alert"
ADD COLUMN "organizationId" UUID;

ALTER TABLE "Recent_Logs"
ADD COLUMN "organizationId" UUID;


-- Backfill organizationId from User relationship
UPDATE "Recent-Alert" ra
SET "organizationId" = u."organizationId"
FROM "User" u
WHERE ra."userId" = u."id";


UPDATE "Recent_Logs" rl
SET "organizationId" = u."organizationId"
FROM "User" u
WHERE rl."userId" = u."id";


-- Make columns required
ALTER TABLE "Recent-Alert"
ALTER COLUMN "organizationId" SET NOT NULL;

ALTER TABLE "Recent_Logs"
ALTER COLUMN "organizationId" SET NOT NULL;


-- Create indexes
CREATE INDEX "Asset_organizationId_idx"
ON "Asset"("organizationId");

CREATE INDEX "Event_organizationId_idx"
ON "Event"("organizationId");

CREATE INDEX "Event_timestamp_idx"
ON "Event"("timestamp");

CREATE INDEX "Event_severity_idx"
ON "Event"("severity");

CREATE INDEX "Recent-Alert_organizationId_idx"
ON "Recent-Alert"("organizationId");

CREATE INDEX "Recent_Logs_organizationId_idx"
ON "Recent_Logs"("organizationId");


-- Add foreign keys
ALTER TABLE "Recent_Logs"
ADD CONSTRAINT "Recent_Logs_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Org"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE "Recent-Alert"
ADD CONSTRAINT "Recent-Alert_organizationId_fkey"
FOREIGN KEY ("organizationId")
REFERENCES "Org"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;