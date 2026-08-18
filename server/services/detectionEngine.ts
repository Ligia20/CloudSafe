import { prisma } from "../lib/prisma.js";

export async function detectEvent(eventId: string) {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { asset: true },
    });

    if (!event) return null;

    const recentEvents = await prisma.event.findMany({
        where: {
            assetId: event.assetId,
            organizationId: event.organizationId,
            timestamp: { gte: new Date(Date.now() - 60_000) },
        },
        orderBy: { timestamp: "desc" },
    });

    let detection: { name: string; severity: string } | null = null;

    if (event.eventType === "authentication_failure") {
        const failures = recentEvents.filter(
            (e: any) => e.eventType === "authentication_failure"
        );
        if (failures.length >= 5) {
            detection = {
                name: "Brute Force Attack Detected",
                severity: "HIGH",
            };
        }
    }

    if (event.eventType === "port_scan") {
       (e: any) => e.eventType === "port_scan"
       const scans = recentEvents.filter(
  (e: any) => e.eventType === "port_scan"
);
        if (scans.length >= 3) {
            detection = {
                name: "Port Scan Detected",
                severity: "MEDIUM",
            };
        }
    }

    if (event.eventType === "malware_execution") {
        detection = {
            name: "Malware Detected",
            severity: "CRITICAL",
        };
    }

    if (event.eventType === "unauthorized_access") {
        detection = {
            name: "Unauthorized Access Detected",
            severity: "HIGH",
        };
    }

    if (!detection) return null;

    const existingAlert = await prisma.recent_Alert_.findFirst({
        where: {
            organizationId: event.organizationId,
            userId: event.asset.userId,
            asset: event.asset.name,
            alert_name_: detection.name,
            status: "Active",
            alert_time: { gte: new Date(Date.now() - 60_000) },
        },
    });

    if (existingAlert) return existingAlert;

    return prisma.recent_Alert_.create({
        data: {
            severity: detection.severity,
            alert_name_: detection.name,
            asset: event.asset.name,
            alert_time: new Date(),
            status: "Active",
            userId: event.asset.userId,
            organizationId: event.organizationId,
        },
    });
}