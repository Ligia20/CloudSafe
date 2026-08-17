import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router=Router();

router.get("/alerts",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;

        if(!organizationId){
            return res.status(401).json({
                error:"Organization required",
            });
        }

        const alerts=await prisma.recent_Alert_.findMany({
            where:{
                organizationId,
            },
            orderBy:{
                alert_time:"desc",
            },
        });

        res.json(alerts);

    }catch(error){
        console.error("FETCH ALERTS ERROR:",error);

        res.status(500).json({
            error:"Failed to fetch alerts",
        });
    }
});


router.get("/alerts/:id",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;
        const alertId=String(req.params.id);

        if(!organizationId){
            return res.status(401).json({
                error:"Organization required",
            });
        }

        const alert=await prisma.recent_Alert_.findFirst({
            where:{
                alert_id:alertId,
                organizationId,
            },
            include:{
                history:{
                    orderBy:{
                        changedAt:"desc",
                    },
                },
            },
        });

        if(!alert){
            return res.status(404).json({
                error:"Alert not found",
            });
        }

        res.json(alert);

    }catch(error){
        console.error("FETCH ALERT ERROR:",error);

        res.status(500).json({
            error:"Failed to fetch alert",
        });
    }
});


router.patch("/alerts/:id",authenticate,async(req,res)=>{
    try{
        const organizationId=req.user?.organizationId;
        const alertId=String(req.params.id);
        const {status}=req.body;

        if(!organizationId){
            return res.status(401).json({
                error:"Organization required",
            });
        }

        const allowedStatuses=[
            "Active",
            "Investigating",
            "Resolved",
        ];

        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                error:"Invalid alert status",
            });
        }

        const alert=await prisma.recent_Alert_.findFirst({
            where:{
                alert_id:alertId,
                organizationId,
            },
        });

        if(!alert){
            return res.status(404).json({
                error:"Alert not found",
            });
        }

        if(alert.status!==status){

            await prisma.alert_History.create({
                data:{
                    alertId:alert.alert_id,
                    userId:req.user!.id,
                    oldStatus:alert.status || "Unknown",
                    newStatus:status,
                },
            });

        }


        const updatedAlert=await prisma.recent_Alert_.update({
            where:{
                alert_id:alert.alert_id,
            },
            data:{
                status,
            },
        });


        res.json({
            message:"Alert updated successfully",
            alert:updatedAlert,
        });


    }catch(error){

        console.error("UPDATE ALERT ERROR:",error);

        res.status(500).json({
            error:"Failed to update alert",
        });
    }
});


router.get("/alerts/:id/history",authenticate,async(req,res)=>{
    try{

        const organizationId=req.user?.organizationId;
        const alertId=String(req.params.id);

        if(!organizationId){
            return res.status(401).json({
                error:"Organization required",
            });
        }


        const alert=await prisma.recent_Alert_.findFirst({
            where:{
                alert_id:alertId,
                organizationId,
            },
        });


        if(!alert){
            return res.status(404).json({
                error:"Alert not found",
            });
        }


        const history=await prisma.alert_History.findMany({
            where:{
                alertId,
            },
            orderBy:{
                changedAt:"desc",
            },
        });


        res.json(history);


    }catch(error){

        console.error("ALERT HISTORY ERROR:",error);

        res.status(500).json({
            error:"Failed to fetch alert history",
        });
    }
});


export default router;