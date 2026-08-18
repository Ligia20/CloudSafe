import {prisma} from "../../lib/prisma.js";

export const updateCloudAssetStatus=async()=>{
    try{
        const offlineBefore=new Date(Date.now()-2*60*1000);

        const offlineAssets=await prisma.asset.findMany({
            where:{
                status:"Active",
                lastSeen:{lt:offlineBefore},
            },
            select:{
                id:true,
                status:true,
            },
        });

        if(offlineAssets.length){
            await prisma.$transaction(
                offlineAssets.flatMap(asset=>[
                    prisma.asset_Status_History.create({
                        data:{
                            assetId:asset.id,
                            oldStatus:asset.status,
                            newStatus:"Offline",
                        },
                    }),
                    prisma.asset.update({
                        where:{id:asset.id},
                        data:{status:"Offline"},
                    }),
                ])
            );

            console.log(
                `ASSET STATUS: ${offlineAssets.length} asset(s) marked Offline`
            );
        }

        const recoveredAssets=await prisma.asset.findMany({
            where:{
                status:"Offline",
                lastSeen:{gte:offlineBefore},
            },
            select:{
                id:true,
                status:true,
            },
        });

        if(recoveredAssets.length){
            await prisma.$transaction(
                recoveredAssets.flatMap(asset=>[
                    prisma.asset_Status_History.create({
                        data:{
                            assetId:asset.id,
                            oldStatus:asset.status,
                            newStatus:"Active",
                        },
                    }),
                    prisma.asset.update({
                        where:{id:asset.id},
                        data:{status:"Active"},
                    }),
                ])
            );

            console.log(
                `ASSET STATUS: ${recoveredAssets.length} asset(s) restored Active`
            );
        }

    }catch(error){
        console.error(
            "ASSET STATUS ERROR:",
            error
        );
    }
};