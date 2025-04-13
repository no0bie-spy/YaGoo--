import { config } from 'dotenv';
import express from 'express'
import connectToDB from './connect';

import cors from 'cors'
const server=express();
config();
const port="8002"
server.use(cors());
server.use(express.json());
connectToDB().then((connectMessage)=>{
    console.log(connectMessage);
    
   
    server.listen(port,()=>{
        console.log("Server Started on Port: "+port)
    })
    
}).catch((e)=>{
    console.log(e)
})

export default server;