-- CreateTable
CREATE TABLE "Recent-Alert " (
    "alert_id" UUID NOT NULL,
    "severity" TEXT,
    "alert_name " TEXT,
    "asset" TEXT,
    "alert_time" TIMESTAMP(6),
    "status" TEXT,

    CONSTRAINT "Recent-Alert _pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "Recent-Logs" (
    "log_id" UUID NOT NULL,
    "asset" TEXT,
    "source_ip" TEXT,
    "event" TEXT,
    "severity" TEXT,
    "action" TEXT,
    "log_time" TIMESTAMP(6),

    CONSTRAINT "Recent-Logs_pkey" PRIMARY KEY ("log_id")
);
