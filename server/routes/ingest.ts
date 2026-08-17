import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { agentAuth } from "../middleware/agentAuth.js";
import { detectEvent } from "../services/detectionEngine.js";

const router = Router();

router.post("/ingest/event", agentAuth, async (req: Request, res: Response) => {
    try {
        const asset = req.asset!;
        const { sourceIp, eventType, message, severity, metadata, timestamp } = req.body;

        if (!eventType || !message || !severity) {
            return res.status(400).json({
                error: "eventType, message, and severity are required",
            });
        }

        const allowedSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        const normalizedSeverity = String(severity).toUpperCase().trim();

        if (!allowedSeverities.includes(normalizedSeverity)) {
            return res.status(400).json({
                error: "Invalid severity",
            });
        }

        let eventTimestamp: Date | undefined;

        if (timestamp) {
            eventTimestamp = new Date(timestamp);

            if (Number.isNaN(eventTimestamp.getTime())) {
                return res.status(400).json({
                    error: "Invalid timestamp",
                });
            }
        }

        const event = await prisma.event.create({
            data: {
                assetId: asset.id,
                organizationId: asset.organizationId,
                sourceIp: sourceIp || null,
                eventType: String(eventType),
                message: String(message),
                severity: normalizedSeverity,
                metadata: metadata || null,
                ...(eventTimestamp ? { timestamp: eventTimestamp } : {}),
            },
        });

        const detection = await detectEvent(event.id);

        await prisma.asset.update({
            where: {
                id: asset.id,
            },
            data: {
                lastSeen: new Date(),
                status: "Active",
                ...(eventType === "SYSTEM_INVENTORY" && metadata
                    ? {
                        os: metadata.platform,
                        cpuCount: metadata.cpuCount,
                        totalMemory: metadata.totalMemory,
                        agentVersion: metadata.agentVersion,
                        lastInventory: new Date(),
                    }
                    : {}),
            },
        });

        return res.status(201).json({
            message: "Event ingested successfully",
            event: {
                id: event.id,
                assetId: event.assetId,
                organizationId: event.organizationId,
                sourceIp: event.sourceIp,
                eventType: event.eventType,
                severity: event.severity,
                metadata: event.metadata,
                timestamp: event.timestamp,
            },
            detection: detection
                ? {
                    detected: true,
                    alertId: detection.alert_id,
                    name: detection.alert_name_,
                    severity: detection.severity,
                }
                : {
                    detected: false,
                },
        });
    } catch (error) {
        console.error("EVENT INGESTION ERROR:", error);

        return res.status(500).json({
            error: "Failed to ingest event",
        });
    }
});

export default router;