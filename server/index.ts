import "dotenv/config";

import express from "express";
import cors from "cors";
import session from "express-session";
import { prisma } from "./lib/prisma.js";

import eventRoutes from "./routes/events.js";
import assetRoutes from "./routes/assets.js";
import dashboardRoutes from "./routes/dashboard.js";
import alertRoutes from "./routes/alerts.js";
import userAuthRoutes from "./routes/userAuth.js";
import simulationRoutes from "./routes/simulations.js";
import ingestRoutes from "./routes/ingest.js";
import agentRoutes from "./routes/agent.js";

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(
  cors({
    origin: [
      "https://localhost:5173",
      "https://moaner-slinging-culinary.ngrok-free.dev",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  })
);

app.use(express.json());
app.set("trust proxy", 1);
const isProduction = process.env.NODE_ENV === "production";
app.use(
    session({
        name: "cloudsafe-session",
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 1000 * 60 * 60,
        },
    })
);

/*
    API ROUTES
*/

app.use("/api/v1", userAuthRoutes);
app.use("/api/v1", eventRoutes);
app.use("/api/v1", assetRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1", alertRoutes);
app.use("/api/v1", simulationRoutes);
app.use("/api/v1", ingestRoutes);
app.use("/api/v1",agentRoutes);



/*
    HEALTH CHECKS
*/

app.get("/", (req, res) => {
    res.status(200).json({
        message: "CloudSafe API is running",
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "CloudSafe SIEM API",
        timestamp: new Date(),
    });
});


app.get("/health/db", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: "healthy",
            database: "connected",
        });
    } catch (error) {
        console.error("DATABASE HEALTH ERROR:", error);

        res.status(500).json({
            status: "unhealthy",
            database: "disconnected",
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `CloudSafe API listening on port ${PORT}`
    );
});
