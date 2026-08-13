/*
  Warnings:

  - You are about to drop the `Recent-Alert ` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recent-Logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Recent-Alert ";

-- DropTable
DROP TABLE "Recent-Logs";

-- CreateTable
CREATE TABLE "Recent_Logs" (
    "log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asset" TEXT,
    "source_ip" TEXT,
    "event" TEXT,
    "severity" TEXT,
    "action" TEXT,
    "log_time" TIMESTAMP(6),

    CONSTRAINT "Recent-Logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Recent-Alert" (
    "alert_id" UUID NOT NULL,
    "severity" TEXT,
    "alert_name " TEXT,
    "asset" TEXT,
    "alert_time" TIMESTAMP(6),
    "status" TEXT,

    CONSTRAINT "Recent-Alert _pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
