import "dotenv/config";
import { prisma } from "./lib/prisma";
import express from "express";
import cors from "cors";

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json());

app.get("/dashboard", async (req, res) => {
  const Recent_Alert_ = await prisma.recent_Alert_.findMany({
    orderBy: [
      { severity: "desc" },
    ],
  });

  const firstPage = await prisma.recent_Logs.findMany({
    take: 10,
    orderBy: [
      { log_id: "asc" },
      { asset: "asc" },
      { source_ip: "asc" },
      { event: "desc" },
    ],
  });
 
  const lastPage = firstPage[firstPage.length - 1];

  const nextPage = lastPage ? await prisma.recent_Logs.findMany({
        take: 10,
        skip: 1,
        cursor: { log_id: lastPage.log_id },
        orderBy:{
            log_id: "asc",
            asset: "asc",
            source_ip: "asc",
        }
  }) : [];

  const Recent_Logs = await prisma.recent_Logs.findMany({
    orderBy: [
      { severity: "desc" },
      { log_time: "desc" },
    ],
  });

  res.json({ Recent_Alert_, Recent_Logs, firstPage, lastPage, nextPage });
  res.status(200).json({ message: "Dashboard data retrieved successfully" });
});

app.get("/logs", async (req, res) => {
  try {
    const logs = await prisma.recent_Logs.findMany();
    res.status(200).json({ message: "Logs retrieved successfully", logs });
  } catch(error) {
    res.status(500).json({ error: "Failed to retrieve logs" });
  }
});

app.get("/clear", async (req, res) => {
  try {
    const now = new Date();

    const oneDayAgo = new Date(
      now.getTime() - 1 * 24 * 60 * 60 * 1000
    );

    const twoDaysAgo = new Date(
      now.getTime() - 2 * 24 * 60 * 60 * 1000
    );

    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    const deleteLowLogs = await prisma.recent_Logs.deleteMany({
      where: {
        severity: "LOW",
        log_time: {
          lt: oneDayAgo,
        },
      },
    });

    const deleteMediumLogs = await prisma.recent_Logs.deleteMany({
      where: {
        severity: "MEDIUM",
        log_time: {
          lt: twoDaysAgo,
        },
      },
    });

    const deleteHighLogs = await prisma.recent_Logs.deleteMany({
      where: {
        severity: "HIGH",
        log_time: {
          lt: sevenDaysAgo,
        },
      },
    });

    const deleteCriticalLogs = await prisma.recent_Logs.deleteMany({
      where: {
        severity: "CRITICAL",
        log_time: {
          lt: thirtyDaysAgo,
        },
      },
    });

    const deleteLowAlerts = await prisma.recent_Alert_.deleteMany({
      where: {
        severity: "LOW",
        alert_time: {
          lt: oneDayAgo,
        },
      },
    });

    const deleteMediumAlerts = await prisma.recent_Alert_.deleteMany({
      where: {
        severity: "MEDIUM",
        alert_time: {
          lt: twoDaysAgo,
        },
      },
    });

    const deleteHighAlerts = await prisma.recent_Alert_.deleteMany({
      where: {
        severity: "HIGH",
        alert_time: {
          lt: sevenDaysAgo,
        },
      },
    });

    const deleteCriticalAlerts = await prisma.recent_Alert_.deleteMany({
      where: {
        severity: "CRITICAL",
        alert_time: {
          lt: thirtyDaysAgo,
        },
      },
    });

    res.status(200).json({
      message: "Old records cleared successfully",

      logs: {
        low: deleteLowLogs.count,
        medium: deleteMediumLogs.count,
        high: deleteHighLogs.count,
        critical: deleteCriticalLogs.count,
      },

      alerts: {
        low: deleteLowAlerts.count,
        medium: deleteMediumAlerts.count,
        high: deleteHighAlerts.count,
        critical: deleteCriticalAlerts.count,
      },
    });

  } catch (error) {
    console.error("CLEAR ERROR:", error);

    res.status(500).json({
      error: "Failed to clear old records",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/assets", async (req, res) => {
  try {
    const logs = await prisma.recent_Logs.findMany();
    res.status(200).json({ message: "Assets retrieved successfully", logs });
  } catch(error) {
    res.status(500).json({ error: "Failed to retrieve assets" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
