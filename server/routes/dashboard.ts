import {Router} from "express";
import {prisma} from "../lib/prisma.js";
import {authenticate} from "../middleware/auth.js";

const router=Router();

router.get("/dashboard/events",authenticate,async(req,res)=>{
  try{
    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({error:"Organization required"});
    }

    const events=await prisma.event.findMany({
      where:{organizationId},
      orderBy:{timestamp:"desc"},
      take:50,
      include:{
        asset:{
          select:{
            id:true,
            name:true,
            hostname:true,
            ipAddress:true,
            status:true,
          },
        },
      },
    });

    res.json(events);
  }catch(error){
    console.error("DASHBOARD EVENTS ERROR:",error);
    res.status(500).json({
      error:"Failed to fetch events",
    });
  }
});

router.get("/dashboard/summary",authenticate,async(req,res)=>{
  try{
    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({
        error:"Organization required",
      });
    }

    const[
      totalEvents,
      totalAssets,
      activeAssets,
      offlineAssets,
      pendingAssets,
      criticalEvents,
      highEvents,
      totalAlerts,
      activeAlerts,
      investigatingAlerts,
      resolvedAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      
    ]=await Promise.all([
      prisma.event.count({
        where:{organizationId},
      }),
      prisma.asset.count({
        where:{organizationId},
      }),
      prisma.asset.count({
        where:{
          organizationId,
          status:"Active",
        },
      }),
      prisma.asset.count({
        where:{
          organizationId,
          status:"Offline",
        },
      }),
      prisma.asset.count({
        where:{
          organizationId,
          status:"Pending",
        },
      }),
      prisma.event.count({
        where:{
          organizationId,
          severity:"CRITICAL",
        },
      }),
      prisma.event.count({
        where:{
          organizationId,
          severity:"HIGH",
        },
      }),
           prisma.recent_Alert_.count({
        where:{organizationId},
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          status:"Active",
        },
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          status:"Investigating",
        },
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          status:"Resolved",
        },
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          severity:"CRITICAL",
        },
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          severity:"HIGH",
        },
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          severity:"MEDIUM",
        },
      }),
      prisma.recent_Alert_.count({
        where:{
          organizationId,
          severity:"LOW",
        },
      }),
    ]);

    res.json({
      totalEvents,
      totalAssets,

      activeAssets,
      offlineAssets,
      pendingAssets,

      criticalEvents,
      highEvents,

      totalAlerts,
      activeAlerts,
      investigatingAlerts,
      resolvedAlerts,

      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
    });
  }catch(error){

    console.error(
      "DASHBOARD SUMMARY ERROR:",
      error
    );

    res.status(500).json({
      error:"Failed to fetch dashboard summary",
    });
  }
});

router.get("/dashboard/status-history",authenticate,async(req,res)=>{
  try{
    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({
        error:"Organization required",
      });
    }
    const history=await prisma.asset_Status_History.findMany({
      where:{
        asset:{
          organizationId,
        },
      },
      orderBy:{
        changedAt:"desc",
      },
      take:50,
      include:{
        asset:{
          select:{
            id:true,
            name:true,
            hostname:true,
          },
        },
      },
    });
    res.json(history);
  }catch(error){
    console.error(
      "DASHBOARD STATUS HISTORY ERROR:",
      error
    );
    res.status(500).json({
      error:"Failed to fetch status history",
    });
  }
});

router.get("/dashboard/alerts",authenticate,async(req,res)=>{
  try{
    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({
        error:"Organization required",
      });
    }

    const alerts=await prisma.recent_Alert_.findMany({
      where:{organizationId},
      orderBy:{
        alert_time:"desc",
      },
      take:50,
    });

    res.json(alerts);
  }catch(error){
    console.error(
      "DASHBOARD ALERTS ERROR:",
      error
    );
    res.status(500).json({
      error:"Failed to fetch alerts",
    });
  }
});

router.get("/dashboard/recent",authenticate,async(req,res)=>{
  try{
    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({
        error:"Organization required",
      });
    }

    const[
      events,
      alerts,
      statusHistory
    ]=await Promise.all([

      prisma.event.findMany({
        where:{organizationId},
        orderBy:{
          timestamp:"desc",
        },
        take:10,
        include:{
          asset:{
            select:{
              id:true,
              name:true,
              hostname:true,
              ipAddress:true,
              status:true,
            },
          },
        },
      }),

      prisma.recent_Alert_.findMany({
        where:{organizationId},
        orderBy:{
          alert_time:"desc",
        },
        take:10,
      }),

      prisma.asset_Status_History.findMany({
        where:{
          asset:{
            organizationId,
          },
        },
        orderBy:{
          changedAt:"desc",
        },
        take:10,
        include:{
          asset:{
            select:{
              id:true,
              name:true,
              hostname:true,
            },
          },
        },
      }),

    ]);


    res.json({
      events,
      alerts,
      statusHistory,
    });


  }catch(error){

    console.error(
      "DASHBOARD RECENT ERROR:",
      error
    );

    res.status(500).json({
      error:"Failed to fetch dashboard data",
    });

  }
});

router.delete("/clear",authenticate,async(req,res)=>{
  try{
    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({
        error:"Organization required",
      });
    }
    const deletedEvents=await prisma.event.deleteMany({
      where:{organizationId},
    });

    const deletedAlerts=await prisma.recent_Alert_.deleteMany({
      where:{organizationId},
    });

    res.json({
      message:"Records cleared successfully",
      deletedEvents:deletedEvents.count,
      deletedAlerts:deletedAlerts.count,
    });
  }catch(error){
    console.error(
      "CLEAR RECORDS ERROR:",
      error
    );
    res.status(500).json({
      error:"Failed to clear records",
    });
  }
});


router.get("/dashboard/status-history",authenticate,async(req,res)=>{
  try{

    const organizationId=req.user?.organizationId;

    if(!organizationId){
      return res.status(401).json({
        error:"Organization required"
      });
    }

    const history=
      await prisma.asset_Status_History.findMany({
        where:{
          asset:{
            organizationId
          }
        },
        orderBy:{
          changedAt:"desc"
        },
        take:50,
        include:{
          asset:{
            select:{
              name:true
            }
          }
        }
      });

    res.json(history);

  }catch(error){

    console.error(
      "STATUS HISTORY ERROR:",
      error
    );

    res.status(500).json({
      error:"Failed to fetch status history"
    });

  }
});

export default router;