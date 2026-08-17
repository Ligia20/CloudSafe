import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { detectEvent } from "../services/detectionEngine.js";
import crypto from "crypto";

const router = Router();

async function getSimulatorAsset(userId:string,organizationId:string) {
    let asset=await prisma.asset.findFirst({
        where:{name:"Attack Simulator",userId,organizationId},
    });

    if(!asset){
        asset=await prisma.asset.create({
            data:{
                name:"Attack Simulator",
                type:"Simulator",
                ipAddress:"192.168.1.100",
                hostname:"attack-simulator",
                status:"Active",
                enrollmentToken:crypto.randomUUID(),
                userId,
                organizationId,
            },
        });
    }

    return asset;
}

async function createEvent(
    assetId:string,
    organizationId:string,
    sourceIp:string,
    eventType:string,
    message:string,
    severity:string
) {
    const event=await prisma.event.create({
        data:{
            assetId,
            organizationId,
            sourceIp,
            eventType,
            message,
            severity,
        },
    });

    return detectEvent(event.id);
}

router.post("/simulate/brute-force",authenticate,async(req,res)=>{
    try{
        const userId=req.user!.id;
        const organizationId=req.user!.organizationId;
        const asset=await getSimulatorAsset(userId,organizationId);

        let detection=null;

        for(let i=0;i<5;i++){
            detection=await createEvent(
                asset.id,
                organizationId,
                "192.168.1.100",
                "authentication_failure",
                "Failed login attempt from external source",
                "HIGH"
            );
        }

        res.json({
            message:"Brute force simulation completed",
            detection:detection?{
                detected:true,
                alertId:detection.alert_id,
                name:detection.alert_name_,
                severity:detection.severity,
            }:{detected:false},
        });
    }catch(error){
        console.error("BRUTE FORCE SIMULATION ERROR:",error);
        res.status(500).json({error:"Failed to simulate brute force attack"});
    }
});

router.post("/simulate/port-scan",authenticate,async(req,res)=>{
    try{
        const userId=req.user!.id;
        const organizationId=req.user!.organizationId;
        const asset=await getSimulatorAsset(userId,organizationId);

        let detection=null;

        for(let i=0;i<3;i++){
            detection=await createEvent(
                asset.id,
                organizationId,
                "192.168.1.100",
                "port_scan",
                `Port ${3000+i} scanned from external source`,
                "MEDIUM"
            );
        }

        res.json({
            message:"Port scan simulation completed",
            detection:detection?{
                detected:true,
                alertId:detection.alert_id,
                name:detection.alert_name_,
                severity:detection.severity,
            }:{detected:false},
        });
    }catch(error){
        console.error("PORT SCAN SIMULATION ERROR:",error);
        res.status(500).json({error:"Failed to simulate port scan"});
    }
});

router.post("/simulate/malware",authenticate,async(req,res)=>{
    try{
        const userId=req.user!.id;
        const organizationId=req.user!.organizationId;
        const asset=await getSimulatorAsset(userId,organizationId);

        const detection=await createEvent(
            asset.id,
            organizationId,
            "192.168.1.100",
            "malware_execution",
            "Malicious process execution detected from external source",
            "CRITICAL"
        );

        res.json({
            message:"Malware simulation completed",
            detection:detection?{
                detected:true,
                alertId:detection.alert_id,
                name:detection.alert_name_,
                severity:detection.severity,
            }:{detected:false},
        });
    }catch(error){
        console.error("MALWARE SIMULATION ERROR:",error);
        res.status(500).json({error:"Failed to simulate malware"});
    }
});

router.post("/simulate/unauthorized-access",authenticate,async(req,res)=>{
    try{
        const userId=req.user!.id;
        const organizationId=req.user!.organizationId;
        const asset=await getSimulatorAsset(userId,organizationId);

        const detection=await createEvent(
            asset.id,
            organizationId,
            "192.168.1.100",
            "unauthorized_access",
            "Unauthorized access attempt from external source",
            "HIGH"
        );

        res.json({
            message:"Unauthorized access simulation completed",
            detection:detection?{
                detected:true,
                alertId:detection.alert_id,
                name:detection.alert_name_,
                severity:detection.severity,
            }:{detected:false},
        });
    }catch(error){
        console.error("UNAUTHORIZED ACCESS SIMULATION ERROR:",error);
        res.status(500).json({error:"Failed to simulate unauthorized access"});
    }
});

export default router;