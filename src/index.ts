import express from 'express'
import userRoutes from './routes/UserRoutes';
import tweetRoutes from './routes/TweetRoutes'
import authRoutes from './routes/AuthRoutes'
import { authenticateToken } from './middlewares/AuthMiddleware'

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/user', authenticateToken, userRoutes);
app.use('/tweet', authenticateToken, tweetRoutes);

app.get('/', (req, res)=>{
    res.send("Hello world");
});



app.listen(3000, ()=>{
    console.log("Server ready at localhost:3000")
})
