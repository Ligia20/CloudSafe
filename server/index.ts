import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import express from "express";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const PORT = 3000;
const app = express();
app.use(express.json());

app.get("/dashboard", async (req, res) => {
  const Recent_Alert_ = await prisma.Recent_Alert_.findMany({
    orderBy: [
      { alert_id: "asc" },
      { severity: "asc" },
      { alert_name_String: "asc" },
      { asset: "asc" },
      { alert_time: "desc" },
      { status: "asc" },
      { createdAt: "desc" },
      { map: "asc" },
    ],
  });

  const Recent_Logs = await prisma.Recent_Logs.findMany({
    orderBy: [
      { log_id: "asc" },
      { asset: "asc" },
      { source_ip: "asc" },
      { event: "desc" },
      { severity: "asc" },
      { action: "asc" },
      { log_time: "desc" },
      { map: "asc" },
    ],
  });

  res.json({ Recent_Alert_, Recent_Logs });
});

app.get("/logs", async (req, res) => {
  const logs = await prisma.Recent_Logs.findMany();
  res.json({ logs });
});

app.get("/clear", async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deleteShortestTerm = await prisma.Recent_Logs.deleteMany({
      where: {
        log_type: "SHORT_TERM",
        log_time: { lt: oneDayAgo },
      },
    });

    const deleteShortTerm = await prisma.Recent_Logs.deleteMany({
      where: {
        log_type: "SHORT_TERM",
        log_time: { lt: twoDaysAgo },
      },
    });

    const deleteMediumTerm = await prisma.Recent_Logs.deleteMany({
      where: {
        log_type: "MEDIUM_TERM",
        log_time: { lt: sevenDaysAgo },
      },
    });

    const deleteLongTerm = await prisma.Recent_Logs.deleteMany({
      where: {
        log_type: "LONG_TERM",
        log_time: { lt: thirtyDaysAgo },
      },
    });

    const deleteAlertsQuick = await prisma.Recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: oneDayAgo },
      },
    });

    const deleteAlertsShort = await prisma.Recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: twoDaysAgo },
      },
    });

    const deleteAlertsMedium = await prisma.Recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: sevenDaysAgo },
      },
    });

    const deleteAlertsLong = await prisma.Recent_Alert_.deleteMany({
      where: {
        log_type: "ALERT",
        alert_time: { lt: thirtyDaysAgo },
      },
    });

    res.json({ deleteShortestTerm, deleteShortTerm, deleteMediumTerm, deleteLongTerm, deleteAlertsQuick, deleteAlertsShort, deleteAlertsMedium, deleteAlertsLong });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear old records" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
