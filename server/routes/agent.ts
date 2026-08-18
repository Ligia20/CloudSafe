import {Router} from "express";
import {prisma} from "../lib/prisma.js";
import {agentAuth} from "../middleware/agentAuth.js";

const router=Router();

router.post("/agent/heartbeat",agentAuth,async(req,res)=>{
    try{
        const asset=req.asset!;
        const {hostname,ipAddress}=req.body;
        const heartbeatTime=new Date();

        const updateData:any={
            status:"Active",
            lastSeen:heartbeatTime,
        };

        if(hostname!==undefined){
            updateData.hostname=String(hostname).trim();
        }

        if(ipAddress!==undefined){
            updateData.ipAddress=String(ipAddress).trim();
        }

        const operations:any[]=[];

        if(asset.status!=="Active"){
            operations.push(
                prisma.asset_Status_History.create({
                    data:{
                        assetId:asset.id,
                        oldStatus:asset.status,
                        newStatus:"Active",
                    },
                })
            );
        }

        operations.push(
            prisma.asset.update({
                where:{
                    id:asset.id,
                },
                data:updateData,
            })
        );

        const results=await prisma.$transaction(
            operations
        );

        const updatedAsset:any=
            results[results.length-1];

        console.log(
            "DATABASE LAST SEEN UPDATED:",
            updatedAsset.lastSeen?.toISOString()
        );

        res.json({
            message:"Heartbeat received",
            assetId:updatedAsset.id,
            status:updatedAsset.status,
            hostname:updatedAsset.hostname,
            ipAddress:updatedAsset.ipAddress,
            lastSeen:updatedAsset.lastSeen,
        });

    }catch(error){
        console.error(
            "AGENT HEARTBEAT ERROR:",
            error
        );

        res.status(500).json({
            error:"Failed to process heartbeat",
        });
    }
});


router.post("/agent/inventory",agentAuth,async(req,res)=>{
    try{
        const asset=req.asset!;

        const {
            os,
            cpuCount,
            totalMemory,
            agentVersion,
        }=req.body;

        const updateData:any={
            lastInventory:new Date(),
        };

        if(os!==undefined){
            updateData.os=String(os).trim();
        }

        if(cpuCount!==undefined){
            updateData.cpuCount=Number(cpuCount);
        }

        if(totalMemory!==undefined){
            updateData.totalMemory=BigInt(totalMemory);
        }

        if(agentVersion!==undefined){
            updateData.agentVersion=String(agentVersion).trim();
        }

        const updatedAsset=await prisma.asset.update({
            where:{
                id:asset.id,
            },
            data:updateData,
        });

        res.json({
            message:"Inventory received",
            assetId:updatedAsset.id,
            os:updatedAsset.os,
            cpuCount:updatedAsset.cpuCount,
            totalMemory:updatedAsset.totalMemory?.toString()||null,
            agentVersion:updatedAsset.agentVersion,
            lastInventory:updatedAsset.lastInventory,
        });

    }catch(error){
        console.error(
            "AGENT INVENTORY ERROR:",
            error
        );

        res.status(500).json({
            error:"Failed to process inventory",
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
        console.error(
            "AGENT EVENT ERROR:",
            error
        );

        res.status(500).json({
            error:"Failed to ingest event",
        });
    }
});


export default router;