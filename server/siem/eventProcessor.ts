import { prisma } from "../lib/prisma.js";
import { normalizeEvent } from "./normalizer.js";
import { checkRules } from "./ruleEngine.js";
import { calculateRisk } from "./riskEngine.js";

export async function processEvent(eventData:any,asset:any){
    try{
        const normalizedEvent=normalizeEvent(eventData);
        const detectedAlerts=checkRules(normalizedEvent);
        const risk=calculateRisk(normalizedEvent,detectedAlerts);

        const newLog=await prisma.recent_Logs.create({
            data:{
                asset:normalizedEvent.asset,
                source_ip:normalizedEvent.source_ip,
                event:normalizedEvent.event,
                severity:normalizedEvent.severity,
                action:normalizedEvent.action,
                riskScore:risk.score,
                riskLevel:risk.riskLevel,
                log_time:new Date(),
                userId:asset.userId,
                organizationId:asset.organizationId,
            },
        });

        const newEvent=await prisma.event.create({
            data:{
                assetId:asset.id,
                organizationId:asset.organizationId,
                sourceIp:normalizedEvent.source_ip,
                eventType:normalizedEvent.event,
                message:normalizedEvent.action,
                severity:normalizedEvent.severity,
            },
        });

        console.log("DETECTED ALERTS:",detectedAlerts);

        if(detectedAlerts.length>0){

            for(const alert of detectedAlerts){

                const alertTime=new Date();

                const existingAlert=await prisma.recent_Alert_.findFirst({
                    where:{
                        organizationId:asset.organizationId,
                        alert_name_:alert.name,
                        status:"Active",
                    },
                });

                let newAlert;

                if(existingAlert){

                    newAlert=await prisma.recent_Alert_.update({
                        where:{
                            alert_id:existingAlert.alert_id,
                        },
                        data:{
                            alert_time:alertTime,
                        },
                    });

                }else{

                    newAlert=await prisma.recent_Alert_.create({
                        data:{
                            severity:alert.severity,
                            alert_name_:alert.name,
                            asset:normalizedEvent.asset,
                            alert_time:alertTime,
                            status:"Active",
                            userId:asset.userId,
                            organizationId:asset.organizationId,
                        },
                    });

                    await prisma.alert_History.create({
                        data:{
                            alertId:newAlert.alert_id,
                            userId:asset.userId,
                            oldStatus:"New",
                            newStatus:"Active",
                            changedAt:alertTime,
                        },
                    });

                }

                console.log("ALERT PROCESSED:",newAlert);

            }
        }

        return {
            message:"Event processed successfully",
            log:newLog,
            event:newEvent,
            alerts:detectedAlerts,
        };

    }catch(error){

        console.error("EVENT PROCESSOR ERROR:",error);
        throw error;
    }
}