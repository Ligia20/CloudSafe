import "dotenv/config";
import { prisma } from "./lib/prisma";
import express, {Request, Response, NextFunction, response} from "express";
import cors from "cors";
import session from "express-session";
import bcrypt from "bcrypt";

const PORT = 3000;
const app = express();

app.use(cors(
    {
        origin: [
            "https://moaner-slinging-culinary.ngrok-free.dev"
        ],
        credentials: true,
    }
));
app.use(express.json());
app.set("trust proxy", 1);
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    name: "cloudsafe-session",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 1000 * 60 * 60,
    },
  })
);

function requireAuth(req: Request, res: Response, next: NextFunction) 
{
    if (!req.session.userId) 
    {
        return res.status(401).json(
            {
                error: "Authentication required",
            }
        );
    }
    next();
}

app.get("/", (req, res) => {
  res.status(200).json({
    message: "CloudSafe API is running",
  });
});

app.post("/register", async (req,res) =>{
    try{
        const {username, password} = req.body;
        if (!username || !password)
        {
            return res.status(400).json({
                error: "Username and password required",
            });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                username: username,
                password: passwordHash,
            },
        });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                userId: user.id,
                username: user.username,
            },
        });
    }   catch(error){
        console.error("REGISTER ERROR:", error);
        res.status(500).json({
            error: "Failed to register user",
        });
    }
});

app.post("/login", async (req,res) => {
    try
    {
        const {username, password} = req.body;
        if (!username || !password)
        {
            return res.status(400).json(
                {
                    error: "Username and password required",
                }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user)
        {
            return res.status(401).json(
                {
                    error: "Invalid username or password",
                }
            );
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
        {
            return res.status(401).json(
                {
                    error: "Invalid username or password",
                }
            );
        }
        req.session.userId = user.id;
        res.status(200).json(
            {
                message: "Login successful",
            }
        );
    }
    catch(error)
    {
        res.status(500).json(
            {
                error: "Failed to login",
            }
        );
        console.error("LOGIN ERROR:", error);
    }
});

app.get("/whoamI", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("ME ERROR:", error);

    res.status(500).json({
      error: "Failed to retrieve user",
    });
  }
});

app.get("/dashboard", requireAuth,async (req, res) => {
  try {
    const userId = req.session.userId;

    const Recent_Alert_ = await prisma.recent_Alert_.findMany({
      where: {
        userId: userId,
      },
      orderBy: [
        { severity: "desc" },
      ],
    });

    const firstPage = await prisma.recent_Logs.findMany({
      where: {
        userId: userId,
      },
      take: 10,
      orderBy: [
        { log_id: "asc" },
        ],
    });
   
    const lastPage = firstPage[firstPage.length - 1];

    const nextPage = lastPage ? await prisma.recent_Logs.findMany({
      where: {
        userId: userId,
      },
          take: 10,
          skip: 1,
          cursor: { log_id: lastPage.log_id },
          orderBy:{
              log_id: "asc",
          }
    }) : [];

    const Recent_Logs = await prisma.recent_Logs.findMany({
      where: {
        userId: userId,
      },
      orderBy: [
        { severity: "desc" },
        { log_time: "desc" },
      ],
    });
    res.status(200).json({ message: "Dashboard data retrieved successfully", Recent_Alert_, Recent_Logs, firstPage, lastPage, nextPage });
  } catch(error) {
    res.status(500).json({ error: "Failed to retrieve dashboard data" });
    console.error("DASHBOARD ERROR:", error);
  }
});

app.get("/logs", requireAuth,async (req, res) => {
  try {
    const logs = await prisma.recent_Logs.findMany({
      where: {
        userId: req.session.userId,
      },
    });
    res.status(200).json({ message: "Logs retrieved successfully", logs });
  } catch(error) {
    res.status(500).json({ error: "Failed to retrieve logs" });
    console.error("LOGS ERROR:", error);
  }
});

app.post("/logout", (req,res) => {
    req.session.destroy((error) =>{
        if(error){
            console.error("LOGOUT ERROR:", error);
            return res.status(500).json({
                error: "Logout failed",
            });
            }
        res.clearCookie("cloudsafe-session", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
});     res.status(200).json({
            message: "Logged out successfully",
        });
    });
});

/*
 * CLEAR OLD RECORDS
 *
 * LOW      = older than 1 day
 * MEDIUM   = older than 2 days
 * HIGH     = older than 7 days
 * CRITICAL = older than 30 days
 *
 * Only records belonging to the
 * authenticated user are deleted.
 */
app.delete("/clear", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const now = new Date();

    const oneDayAgo = new Date(
      now.getTime() - 1 * 24 * 60 * 60 * 1000
    );

    const twoDaysAgo = new Date(
      now.getTime() - 2 * 24 * 60 * 60 * 1000
    );

    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    const deleteLogs = await prisma.recent_Logs.deleteMany({
      where: {
        userId: userId,
        OR: [
          {
            severity: "LOW",
            log_time: {
              lt: oneDayAgo,
            },
          },

          {
            severity: "MEDIUM",
            log_time: {
              lt: twoDaysAgo,
            },
          },

          {
            severity: "HIGH",
            log_time: {
              lt: sevenDaysAgo,
            },
          },

          {
            severity: "CRITICAL",
            log_time: {
              lt: thirtyDaysAgo,
            },
          },
        ],
      },
    });

    const deleteAlerts = await prisma.recent_Alert_.deleteMany({
      where: {
        userId: userId,
        OR: [
          {
            severity: "LOW",
            alert_time: {
              lt: oneDayAgo,
            },
          },
          
          {
            severity: "MEDIUM",
            alert_time: {
              lt: twoDaysAgo,
            },
          },

          {
            severity: "HIGH",
            alert_time: {
              lt: sevenDaysAgo,
            },
          },

          {
            severity: "CRITICAL",
            alert_time: {
              lt: thirtyDaysAgo,
            },
          },
        ],
      },
    });

    res.status(200).json({

      message:
        "Old records cleared successfully",
        logs:
        deleteLogs.count,
      alerts:
        deleteAlerts.count,

    });

  }
  catch (error) {
  console.error("CLEAR ERROR:",error);


    res.status(500).json({
      error:
        "Failed to clear old records",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/assets", requireAuth, async (req, res) => {
  try {
    const freshAssets = await prisma.asset.findMany({
      where: {
        userId: req.session.userId
      },
    });

    console.log("Fresh Assets:", freshAssets);
    res.status(200).json({
      message: "Assets retrieved successfully",
      assets: freshAssets,
    });
  } catch(error) {
    res.status(500).json({
      error: "Failed to retrieve assets"
    });
  }
  
});
app.delete("/account", requireAuth, async (req, res) =>{
  try{
    const userId = req.session.userId;
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })
    req.session.destroy((error) =>{
      if(error){
        console.error("SESSION  DESTROY ERROR", error);
        return res.status(500).json({
          error: "Account deleted, but session cleanup failed",
        });
      }

      res.clearCookie(
        "cloudsafe-session",
        {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }
      );

      return res.status(200).json({
        message: "Account deleted successfully"
      });
    })
  }
  catch (error){
    console.error("DELETE ACCOUNT ERROR:" , error)
    res.status(500).json({
      error: "Failed to delete account",
    })
  }
});

app.get("/auth/whoamI", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.session.userId,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      error: "User not found",
    });
  }

  res.json({
    authenticated: true,
    user,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on http://localhost:${PORT}`);
});