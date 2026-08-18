import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req:Request,res:Response,next:NextFunction){
    try{
        const authHeader=req.headers.authorization;

        console.log("AUTH HEADER:",authHeader);

        if(!authHeader){
            return res.status(401).json({
                error:"Authentication required",
            });
        }

        const token=authHeader.split(" ")[1];

        console.log("TOKEN:",token);
        console.log("SECRET:",process.env.JWT_SECRET);
        console.log("DECODED TOKEN:",jwt.decode(token));

        const decoded=jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            id:string;
            organizationId:string;
        };
        req.user=decoded;
        next();

    }catch(error){
        console.error("AUTH ERROR:",error);
        res.status(401).json({
            error:"Invalid token",
        });
    }
}