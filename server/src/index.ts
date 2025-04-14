import { config } from 'dotenv';
import express from 'express'
import connectToDB from './connect';

import cors from 'cors'
import mainRoutes from './routes/mainRoutes';
import env from './Ienv';
const server=express();
config();
const port=env.PORT
server.use(cors());
server.use(express.json());
connectToDB().then((connectMessage)=>{
    console.log(connectMessage);
    
    server.use(mainRoutes) 
    server.listen(port,()=>{
        console.log("Server Started on Port: "+port)
    })
    
}).catch((e)=>{
    console.log(e)
})

export default server;