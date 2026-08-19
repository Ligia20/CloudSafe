import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();


router.post("/register", async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
        } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password required",
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const organization = await prisma.organization.create({
            data: {
                name: username + " Organization",
            },
        });

        const user = await prisma.user.create({
            data: {
                username,
                password: passwordHash,
                organizationId: organization.id,
            },
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                userId: user.id,
                username: user.username,
            },
        });

    } catch (error) {

        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            error: "Failed to register user",
        });
    }
});


router.post("/login", async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
        } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                username,
            },
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }


        const validPassword = await bcrypt.compare(
            password,
            user.password
        );


        if (!validPassword) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }


        const token = jwt.sign(
            {
                id: user.id,
                organizationId: user.organizationId,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "1h",
            }
        );


        res.json({
            message: "Login successful",
            token,
        });


    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            error: "Failed to login",
        });
    }
});


router.get("/whoami", authenticate, async (req, res) => {

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: req.user?.id,
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
            user,
        });


    } catch(error) {

        console.error("WHOAMI ERROR:", error);

        res.status(500).json({
            error: "Failed to retrieve user",
        });
    }
});


router.post("/logout", (req, res) => {

    req.session.destroy((error) => {

        if(error){

            console.error("LOGOUT ERROR:", error);

            return res.status(500).json({
                error:"Logout failed",
            });
        }


        res.clearCookie(
            "cloudsafe-session",
            {
                httpOnly:true,
                secure:true,
                sameSite:"none",
            }
        );


        res.json({
            message:"Logged out successfully",
        });

    });

});

router.delete("/account",authenticate,async(req,res)=>{
    try{
        const userId=req.user?.id;

        const assets=await prisma.asset.findMany({
            where:{userId},
            select:{id:true},
        });

const assetIds=assets.map((asset: any)=>asset.id);
        await prisma.event.deleteMany({
            where:{
                assetId:{
                    in:assetIds,
                },
            },
        });

        await prisma.asset.deleteMany({
            where:{userId},
        });

        await prisma.alert_History.deleteMany({
            where:{userId},
        });

        await prisma.user.delete({
            where:{id:userId},
        });

        res.json({
            message:"Account deleted successfully",
        });
    }catch(error){
        console.error("DELETE ACCOUNT ERROR:",error);
        res.status(500).json({
            error:"Failed to delete account",
        });
    }
});

export default router;