CREATE TABLE "Asset_Status_History" (
    "id" UUID NOT NULL,
    "assetId" UUID NOT NULL,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_Status_History_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Asset_Status_History_assetId_idx"
ON "Asset_Status_History"("assetId");

ALTER TABLE "Asset_Status_History"
ADD CONSTRAINT "Asset_Status_History_assetId_fkey"
FOREIGN KEY ("assetId")
REFERENCES "Asset"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
