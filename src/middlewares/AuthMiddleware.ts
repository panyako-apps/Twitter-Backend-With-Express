import { NextFunction, Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import jwt from "jsonwebtoken";


const JWT_SECRET = 'jwt-secret'
const prisma = new PrismaClient();


type AuthRequest = Request & {user?: User}

export async function authenticateToken(
    req:AuthRequest, 
    res: Response, 
    next: NextFunction)
    {
    const authHeader = req.headers['authorization']
    const jwtToken = authHeader?.split(" ")[1];

    if(!jwtToken){
        return res.sendStatus(401)
    }

    try {
        const jwtPayload = jwt.verify(jwtToken, JWT_SECRET) as {tokenId: number}
        const dbToken = await prisma.token.findUnique({
            where: {id: jwtPayload.tokenId},
            include: { 
                user: true
            }
        })
        
        if(!dbToken?.valid || dbToken.expiration < new Date()){
            return res.status(401).json("Token is expired")
        }
        
        req.user = dbToken.user;

    } catch (error) {
        return res.sendStatus(401);
    }

    next();
}