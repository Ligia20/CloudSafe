import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export async function agentAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token =
            req.headers["x-enrollment-token"] as string;

        if (!token) {
            return res.status(401).json({
                error: "Enrollment token required",
            });
        }

        const asset =
            await prisma.asset.findUnique({
                where: {
                    enrollmentToken: token,
                },
            });

        if (!asset) {
            console.error(
                "AGENT AUTH FAILED: invalid enrollment token"
            );

            return res.status(401).json({
                error: "Invalid enrollment token",
            });
        }

        console.log(
            "================================="
        );

        console.log(
            "AGENT AUTHENTICATED ASSET:"
        );

        console.log(
            "Asset ID:",
            asset.id
        );

        console.log(
            "Asset Name:",
            asset.name
        );

        console.log(
            "Asset Status:",
            asset.status
        );

        console.log(
            "================================="
        );

        req.asset = asset;

        next();

    } catch (error) {
        console.error(
            "AGENT AUTH ERROR:",
            error
        );

        return res.status(500).json({
            error: "Agent authentication failed",
        });
    }
}