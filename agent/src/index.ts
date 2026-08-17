import "dotenv/config";
import os from "os";
import { collectSystem } from "./collector/system.js";

const API_URL = process.env.CLOUDSAFE_API_URL;
const ENROLLMENT_TOKEN = process.env.CLOUDSAFE_ENROLLMENT_TOKEN;

if (!API_URL || !ENROLLMENT_TOKEN) {
    console.error("CLOUDSAFE_API_URL and CLOUDSAFE_ENROLLMENT_TOKEN are required");
    process.exit(1);
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const network of interfaces[name] || []) {
            if (network.family === "IPv4" && !network.internal) {
                return network.address;
            }
        }
    }

    return "127.0.0.1";
}

function getMetadata() {
    return {
        hostname: os.hostname(),
        platform: os.platform(),
        architecture: os.arch(),
        agentVersion: "1.0.0",
    };
}

async function heartbeat() {
    try {
        const response = await fetch(`${API_URL}/api/v1/agent/heartbeat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-enrollment-token": ENROLLMENT_TOKEN,
            },
            body: JSON.stringify({
                sourceIp: getLocalIp(),
                eventType: "AGENT_HEARTBEAT",
                message: `CloudSafe agent online: ${os.hostname()}`,
                severity: "LOW",
                metadata: getMetadata(),
                timestamp: new Date().toISOString(),
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("HEARTBEAT FAILED:", response.status, data);
            return;
        }

        console.log("HEARTBEAT RECEIVED:", data);
    } catch (error) {
        console.error("HEARTBEAT ERROR:", error);
    }
}

async function sendEvent() {
    try {
        const response = await fetch(`${API_URL}/api/v1/ingest/event`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-enrollment-token": ENROLLMENT_TOKEN,
            },
            body: JSON.stringify({
                sourceIp: getLocalIp(),
                eventType: "AGENT_HEARTBEAT",
                message: `CloudSafe agent online: ${os.hostname()}`,
                severity: "LOW",
                metadata: getMetadata(),
                timestamp: new Date().toISOString(),
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("EVENT SEND FAILED:", response.status, data);
            return;
        }

        console.log("EVENT SENT:", data);
    } catch (error) {
        console.error("EVENT ERROR:", error);
    }
}

async function sendInventory() {
    try {
        const response = await fetch(`${API_URL}/api/v1/ingest/event`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-enrollment-token": ENROLLMENT_TOKEN,
            },
            body: JSON.stringify({
                sourceIp: getLocalIp(),
                eventType: "SYSTEM_INVENTORY",
                message: `System inventory collected: ${os.hostname()}`,
                severity: "LOW",
                metadata: collectSystem(),
                timestamp: new Date().toISOString(),
            }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error("INVENTORY FAILED:", response.status, data);
            return;
        }

        console.log("INVENTORY SENT:", data);
    } catch (error) {
        console.error("INVENTORY ERROR:", error);
    }
}

console.log("CloudSafe agent starting...");
console.log("Hostname:", os.hostname());

heartbeat();
sendEvent();
sendInventory();

setInterval(heartbeat, 30000);
setInterval(sendEvent, 60000);
setInterval(sendInventory, 3600000);