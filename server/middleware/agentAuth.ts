import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export async function agentAuth(req:Request, res:Response, next:NextFunction){
    try{
        const token = req.headers["x-enrollment-token"] as string;
        if(!token){
            return res.status(401).json({
                error:"Enrollment token required",
            });
        }
        const asset = await prisma.asset.findUnique({
            where:{
                enrollmentToken:token,
            },
        });
        if(!asset){
            return res.status(401).json({
                error:"Invalid enrollment token",
            });
        }
        req.asset = asset;
        next();
    }catch(error){
        console.error("AGENT AUTH ERROR:",error);
        res.status(500).json({
            error:"Agent authentication failed",
        });
    }
}