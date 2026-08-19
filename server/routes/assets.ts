import {Router} from "express";
import {prisma} from "../lib/prisma.js";
import {authenticate} from "../middleware/auth.js";
import crypto from "crypto";

const router=Router();

router.post("/assets/enroll",authenticate,async(req,res)=>{
    try{
        const userId=req.user?.id;

        if(!userId){
            return res.status(401).json({
                error:"Authentication required"
            });
        }

        const user=await prisma.user.findUnique({
            where:{id:userId}
        });

        if(!user){
            return res.status(404).json({
                error:"User not found"
            });
        }

        const {
            name,
            type,
            ipAddress,
            hostname
        }=req.body;

        if(!name||!type){
            return res.status(400).json({
                error:"Asset name and asset type are required"
            });
        }

        const enrollmentToken=
            crypto.randomBytes(32).toString("hex");

        const asset=await prisma.asset.create({
            data:{
                name:String(name).trim(),
                type:String(type).trim(),
                ipAddress:ipAddress
                    ?String(ipAddress).trim()
                    :"",
                hostname:hostname
                    ?String(hostname).trim()
                    :null,
                enrollmentToken,
                userId:user.id,
                organizationId:user.organizationId,
                status:"Pending",
            },
        });

        res.status(201).json({
            message:"Asset enrolled successfully",
            asset:{
                id:asset.id,
                name:asset.name,
                type:asset.type,
                ipAddress:asset.ipAddress,
                hostname:asset.hostname,
                status:asset.status,
                createdAt:asset.createdAt,
            },
            enrollmentToken:asset.enrollmentToken,
        });

    }catch(error){
        console.error("ASSET ENROLLMENT ERROR:",error);
        res.status(500).json({
            error:"Failed to enroll asset"
        });
    }
});

router.get("/assets",authenticate,async(req,res)=>{
    try{
        res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma","no-cache");
        res.set("Expires","0");

        const organizationId=req.user?.organizationId;

        if(!organizationId){
            return res.status(401).json({
                error:"Organization required"
            });
        }

        const assets=await prisma.asset.findMany({
            where:{
                organizationId,
                type:{
                    not:"Simulator",
                },
            },
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
            orderBy:{
                createdAt:"desc"
            },
        });
            console.log("ASSET RESPONSE TEST:",assets[0]);
        res.json(
            assets.map((asset: any)=>({
                ...asset,
                totalMemory:asset.totalMemory?.toString()||null,
            }))
        );

    }catch(error){
        console.error("FETCH CLOUD ASSETS ERROR:",error);
        res.status(500).json({
            error:"Failed to retrieve cloud assets"
        });
    }
});

router.get("/assets/:id",authenticate,async(req,res)=>{
    try{
        res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma","no-cache");
        res.set("Expires","0");

        const organizationId=req.user?.organizationId;
        const assetId=String(req.params.id);

        const asset=await prisma.asset.findFirst({
            where:{
                id:assetId,
                organizationId,
                type:{
                    not:"Simulator",
                },
            },
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
                events:{
                    orderBy:{
                        timestamp:"desc",
                    },
                    take:20,
                },

                statusHistory:{
                    orderBy:{
                        changedAt:"desc",
                    },
                    take:50,
                },
                
            },
        });
        if(!asset){
            return res.status(404).json({
                error:"Asset not found"
            });
        }

        res.json({
            ...asset,
            totalMemory:asset.totalMemory?.toString()||null,
        });

    }catch(error){
        console.error("FETCH ASSET ERROR:",error);
        res.status(500).json({
            error:"Failed to fetch asset"
        });
    }
});


router.get("/assets/:id/status-history",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;
        const assetId=String(req.params.id);

        const asset=await prisma.asset.findFirst({
            where:{
                id:assetId,
                organizationId,
                type:{
                    not:"Simulator",
                },
            },
        });

        if(!asset){
            return res.status(404).json({
                error:"Asset not found"
            });
        }

        const history=await prisma.asset_Status_History.findMany({
            where:{
                assetId,
            },
            orderBy:{
                changedAt:"desc",
            },
            take:50,
        });

        res.json(history);

    }catch(error){
        console.error("FETCH STATUS HISTORY ERROR:",error);
        res.status(500).json({
            error:"Failed to retrieve status history"
        });
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
                type:{
                    not:"Simulator",
                },
            },
        });

        if(!asset){
            return res.status(404).json({
                error:"Asset not found"
            });
        }

        const updatedAsset=await prisma.asset.update({
            where:{
                id:assetId,
            },
            data:{
                name:req.body.name!==undefined
                    ?String(req.body.name).trim()
                    :undefined,

                type:req.body.type!==undefined
                    ?String(req.body.type).trim()
                    :undefined,

                ipAddress:req.body.ipAddress!==undefined
                    ?String(req.body.ipAddress).trim()
                    :undefined,

                hostname:req.body.hostname!==undefined
                    ?req.body.hostname
                        ?String(req.body.hostname).trim()
                        :null
                    :undefined,

                status:req.body.status!==undefined
                    ?String(req.body.status)
                    :undefined,
            },
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
        });

        res.json({
            message:"Asset updated successfully",
            asset:{
                ...updatedAsset,
                totalMemory:updatedAsset.totalMemory?.toString()||null,
            },
        });

    }catch(error){
        console.error("UPDATE ASSET ERROR:",error);
        res.status(500).json({
            error:"Failed to update asset"
        });
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
                type:{
                    not:"Simulator",
                },
            },
        });

        if(!asset){
            return res.status(404).json({
                error:"Asset not found"
            });
        }

        await prisma.asset.delete({
            where:{
                id:assetId,
            },
        });

        res.json({
            message:"Asset deleted successfully"
        });

    }catch(error){
        console.error("DELETE ASSET ERROR:",error);
        res.status(500).json({
            error:"Failed to delete asset"
        });
    }
});

export default router;