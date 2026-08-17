-- CreateTable
CREATE TABLE "Alert-History" (
    "id" UUID NOT NULL,
    "alertId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert-History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert-History_alertId_idx" ON "Alert-History"("alertId");

-- CreateIndex
CREATE INDEX "Alert-History_userId_idx" ON "Alert-History"("userId");

-- AddForeignKey
ALTER TABLE "Alert-History" ADD CONSTRAINT "Alert-History_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Recent-Alert"("alert_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert-History" ADD CONSTRAINT "Alert-History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
