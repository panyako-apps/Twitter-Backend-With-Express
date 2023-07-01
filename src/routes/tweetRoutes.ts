import { Router } from "express";
import { PrismaClient } from "@prisma/client";


const router = Router();
const prisma = new PrismaClient();

//create Tweet 
router.post('/', async (req, res)=>{
    const {content, image, userId} = req.body;

    try {
        const result = await prisma.tweet.create({
            data: {
                content,
                image, 
                userId
            }
        });

        res.status(201).json({
            success: "Tweet Created Successfully", 
            tweet: result
        })

    } catch (error) {
        res.json({
            error: "Failed to create tweet"
        })
    }

})

//List all tweets
router.get('/', async (req, res)=>{

    try {
        const tweets = await prisma.tweet.findMany({
            include: { 
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }, 

        });

        res.status(200).json(tweets)
        
    } catch (error) {
        res.status(400).json({
            error: "An error occurred while fetching tweets"
        })
    }
})


//Get single tweet
router.get('/:id', async (req, res)=>{

    const {id} = req.params;

    try {
        const tweet = await prisma.tweet.findUnique({where: {id: Number(id)}, include: {user: true}});
        if(!tweet){
            return res.status(404).json({error: "Tweet not Found"});
        }    
        
        res.status(200).json(tweet);

    } catch (error) {   
        res.status(400).json({
            error: "An error occured"
        })
    }
   
})


//Update Tweet 
router.put('/:id', async (req, res)=>{
    const {id} = req.params;
    const { content} = req.body;
    try {
        const tweet = await prisma.tweet.update({
            where: {id: Number(id)},
            data: {
                content: content
            }
        })

        if(!tweet){
            return res.status(404).json({error: "Tweet not found"})
        }

        res.status(200).json({
            success: "Tweet Updated Successfully", 
            tweet: tweet
        })


    } catch (error) {
        res.status(400).json({error: "An error occurred! Tweet not updated"})
    }

})

//Delete a Tweet
router.delete('/:id', async (req, res)=>{
    const {id} = req.params
    try {
        const tweet = await prisma.tweet.delete({where: {id: Number(id)}})
        if(!tweet){
            res.status(404).json({
                error: "Tweet not found"
            })
        }
        res.status(200).json({
            success: "Tweet deleted successfully"
        })
    } catch (error) {
        res.status(400).json({
            error: "An error occured ! Tweet not deleted."
        });
    }
})


export default router;