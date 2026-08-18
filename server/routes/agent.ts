import {Router} from "express";
import {prisma} from "../lib/prisma.js";
import {agentAuth} from "../middleware/agentAuth.js";

const router=Router();

router.post("/agent/heartbeat",agentAuth,async(req,res)=>{
    try{
        const asset=req.asset!;

        const updatedAsset=await prisma.asset.update({
            where:{
                id:asset.id,
            },
            data:{
                status:"Online",
                hostname:req.body.hostname,
                ipAddress:req.body.ipAddress,
                lastSeen:new Date(),
            },
        });

        res.json({
            message:"Heartbeat received",
            assetId:updatedAsset.id,
            status:updatedAsset.status,
            hostname:updatedAsset.hostname,
            ipAddress:updatedAsset.ipAddress,
            lastSeen:updatedAsset.lastSeen,
        });

    }catch(error){
        console.error("AGENT HEARTBEAT ERROR:",error);

        res.status(500).json({
            error:"Failed to process heartbeat",
        });
    }
});

router.post("/agent/events",agentAuth,async(req,res)=>{
    try{
        const asset=req.asset!;

        const {
            eventType,
            message,
            severity,
            sourceIp,
        }=req.body;

        if(!eventType||!message||!severity){
            return res.status(400).json({
                error:"Missing event data",
            });
        }

        const event=await prisma.event.create({
            data:{
                assetId:asset.id,
                organizationId:asset.organizationId,
                eventType,
                message,
                severity,
                sourceIp:sourceIp||asset.ipAddress,
            },
        });

        res.json({
            message:"Event received",
            eventId:event.id,
        });

    }catch(error){

        console.error("AGENT EVENT ERROR:",error);

        res.status(500).json({
            error:"Failed to ingest event",
        });
    }
});

export default router;