import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'


const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 12;
const JWT_SECRET = 'jwt-secret'

const router = Router();
const prisma = new PrismaClient();

function generateEmailToken(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateJwtAuthToken(tokenId: number): string{
    const jwtPayload = {tokenId};

    return jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: "HS256",
        noTimestamp: true
    })
}

//Create a user, if they dont exits
// Generate the emailToken and send to their email
router.post('/login',async (req, res) => {
     
    const {email} = req.body;

    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
    
    try {
        const createdToken = await prisma.token.create({
            data: {
                type: "EMAIL",
                emailToken, 
                expiration, 
                user: {
                    connectOrCreate : {
                        where:{email},
                        create: {email}
                    }
                }
            }
        });
    
        console.log(createdToken);
    
        //Send emailToken to user's email
    
        res.sendStatus(200);
        
    } catch (error) {
        console.log(error)
        res.status(400).json(
            {
                error: "Could not login"
            }
        )
    }


})

//Validate the emailToken
//Generate a long lived JWT token 

router.post('/authenticate', async (req, res) => {
    const {email, emailToken} =req.body;

    const dbEmailToken = await prisma.token.findUnique({
        where: {
            emailToken
        }, 
        include: {
            user: true
        }
    })

    // console.log(dbEmailToken);
    if(!dbEmailToken || !dbEmailToken.valid){
        return res.sendStatus(401);
    }
    
    if(dbEmailToken.expiration < new Date()){
        return res.status(401).json({error: "Token is expired"})
    }


    if(dbEmailToken?.user?.email !== email)
    {
        return res.sendStatus(401);
    }    
    
    const expiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000);
    
    const apiToken = await prisma.token.create({
        data: {
            type: "API",
            expiration,
            user: {
                connect: {email}
            }
        },
    });


    await prisma.token.update({
        where: {id: dbEmailToken.id},
        data: {
            valid: false
        }
    });


    //Generate jwt token 
    const jwtAuthToken =  generateJwtAuthToken(apiToken.id)

    res.json({"jwtAuthToken": jwtAuthToken});

})




export default router;
