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
    res.status(200).json({ message: "Login successful" });
  } catch(error) {
    res.status(500).json({ error: "Failed to retrieve logs" });
  }
});

app.get("/clear", async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deleteShortestTerm = await prisma.recent_Logs.deleteMany({
      where: {
        log_type: "SHORT_TERM",
        log_time: { lt: oneDayAgo },
      },
    });

    const deleteShortTerm = await prisma.recent_Logs.deleteMany({
      where: {
        log_type: "SHORT_TERM",
        log_time: { lt: twoDaysAgo },
      },
    });

    const deleteMediumTerm = await prisma.recent_Logs.deleteMany({
      where: {
        log_type: "MEDIUM_TERM",
        log_time: { lt: sevenDaysAgo },
      },
    });

    const deleteLongTerm = await prisma.recent_Logs.deleteMany({
      where: {
        log_type: "LONG_TERM",
        log_time: { lt: thirtyDaysAgo },
      },
    });

    const deleteAlertsQuick = await prisma.recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: oneDayAgo },
      },
    });

    const deleteAlertsShort = await prisma.recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: twoDaysAgo },
      },
    });

    const deleteAlertsMedium = await prisma.recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: sevenDaysAgo },
      },
    });

    const deleteAlertsLong = await prisma.recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: thirtyDaysAgo },
      },
    });

    res.status(200).json({ message: "Old records cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear old records" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
