import { Router } from "express";
import { PrismaClient } from "@prisma/client";


const router = Router();
const prisma = new PrismaClient();


//create item
router.post('/', async (req, res)=>{

    const {name, email, username} = req.body;

    try {
        
        const result = await prisma.user.create({
            data: {
                email, 
                name,
                username, 
                bio: "I am new to this application",
            }
        })

        if(result){
            res.status(201).json(result)
        }

    } catch (e) {
        res.status(400).json({error: "Username and password must be unique"})
    }
})

//get all items 
router.get('/', async (req, res)=>{
    const allUsers = await prisma.user.findMany();
    res.json(allUsers);
})

//get single item
router.get('/:id', async (req, res)=>{
    const {id} = req.params
    const user = await prisma.user.findUnique({where: {id: Number(id)}})
    res.json(user)
})


//update an item
router.put('/:id', async (req, res)=>{
    const {id} = req.params
    const {bio, name, image } = req.body;
    try {
        const result = await prisma.user.update({
            where: {id: Number(id)},
            data: { bio, name, image}
        });

        if(result){

            res.status(201).json({success: `Updated Successfully`})
        }

    } catch (e) {
        res.status(400).json({error: "Failed to update the user"})
    }
    
})

//delete an item 
router.delete('/:id', async (req, res)=>{
    const {id} = req.params

    try {
        const result = await prisma.user.delete({
            where: {id: Number(id)}
        });

        if(result){

            res.status(200).json({success: `Item Deleted Successfully`});
            res.sendStatus(200);
        }

    } catch (e) {
        res.status(400).json({error: "Failed to delete the item"})
    }

})

export default router;