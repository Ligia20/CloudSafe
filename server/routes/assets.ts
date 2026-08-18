import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import crypto from "crypto";

const router=Router();

router.post("/assets/enroll",authenticate,async(req,res)=>{
    try{
        const userId=req.user?.id;
        const user=await prisma.user.findUnique({where:{id:userId}});

        if(!user)return res.status(404).json({error:"User not found"});

        const enrollmentToken=crypto.randomBytes(32).toString("hex");

        const asset=await prisma.asset.create({
            data:{
                name:req.body.name,
                type:req.body.type,
                ipAddress:req.body.ipAddress,
                hostname:req.body.hostname,
                enrollmentToken,
                userId:user.id,
                organizationId:user.organizationId,
            },
        });

        res.status(201).json({
            message:"Asset enrolled successfully",
            asset,
        });
    }catch(error){
        console.error("ASSET ENROLLMENT ERROR:",error);
        res.status(500).json({error:"Failed to enroll asset"});
    }
});

router.get("/assets",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;

        if(!organizationId)return res.status(401).json({error:"Organization required"});

        const assets=await prisma.asset.findMany({
            where:{organizationId},
            select:{
                id:true,
                name:true,
                type:true,
                ipAddress:true,
                hostname:true,
                status:true,
                os:true,
                cpuCount:true,
                totalMemory:true,
                agentVersion:true,
                lastSeen:true,
                lastInventory:true,
                createdAt:true,
            },
            orderBy:{createdAt:"desc"},
        });

        res.json(assets);
    }catch(error){
        console.error("FETCH ASSETS ERROR:",error);
        res.status(500).json({error:"Failed to retrieve assets"});
    }
});

router.get("/assets/:id",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;
        const assetId=String(req.params.id);

        const asset=await prisma.asset.findFirst({
            where:{
                id:assetId,
                organizationId,
            },
            include:{
                events:{
                    orderBy:{timestamp:"desc"},
                    take:20,
                },
            },
        });

        if(!asset)return res.status(404).json({error:"Asset not found"});

        res.json(asset);
    }catch(error){
        console.error("FETCH ASSET ERROR:",error);
        res.status(500).json({error:"Failed to fetch asset"});
    }
});

router.patch("/assets/:id",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;
        const assetId=String(req.params.id);

        const asset=await prisma.asset.findFirst({
            where:{
                id:assetId,
                organizationId,
            },
        });

        if(!asset)return res.status(404).json({error:"Asset not found"});

        const updatedAsset=await prisma.asset.update({
            where:{id:assetId},
            data:{
                name:req.body.name,
                type:req.body.type,
                ipAddress:req.body.ipAddress,
                hostname:req.body.hostname,
                status:req.body.status,
            },
        });

        res.json({
            message:"Asset updated successfully",
            asset:updatedAsset,
        });
    }catch(error){
        console.error("UPDATE ASSET ERROR:",error);
        res.status(500).json({error:"Failed to update asset"});
    }
});

router.delete("/assets/:id",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;
        const assetId=String(req.params.id);

        const asset=await prisma.asset.findFirst({
            where:{
                id:assetId,
                organizationId,
            },
        });

        if(!asset)return res.status(404).json({error:"Asset not found"});

        await prisma.asset.delete({
            where:{id:assetId},
        });

        res.json({message:"Asset deleted successfully"});
    }catch(error){
        console.error("DELETE ASSET ERROR:",error);
        res.status(500).json({error:"Failed to delete asset"});
    }
});

export default router;