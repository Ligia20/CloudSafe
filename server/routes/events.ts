import { Router } from "express";
import { processEvent } from "../siem/eventProcessor.js";
import { agentAuth } from "../middleware/agentAuth.js";

const router=Router();


router.post("/events",agentAuth,async(req,res)=>{
    try{

        const asset=req.asset;


        if(!asset){
            return res.status(401).json({
                error:"Asset authentication failed",
            });
        }


        if(!req.body){
            return res.status(400).json({
                error:"Event payload required",
            });
        }


        console.log("EVENT RECEIVED:",{
            asset:asset.name,
            event:req.body.event,
        });


        const result=await processEvent(
            req.body,
            asset
        );


        res.status(201).json(result);


    }catch(error){

        console.error("EVENT ROUTE ERROR:",error);

        res.status(500).json({
            error:"Failed to process event",
        });
    }
});


export default router;