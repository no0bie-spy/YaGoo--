import { NextFunction, Request,Response } from "express"
import jwt,{JwtPayload} from 'jsonwebtoken'
import env from "../Ienv";
import IRequest from "./IRequest";
const getUserfromAuthToken=async(req:IRequest,res:Response,next:NextFunction)=>{
    try{
         const authToken=req.headers['authorization'];
       
        
        const decode=jwt.verify(authToken as string,env.JWT_SECRET);
       if(decode){
        if(typeof decode==="string"){
            res.status(403).json({
                message:"You arenot authorized"
            })
            return
        }
        req.userId = (decode as JwtPayload).userId;
        console.log(req.userId)
        next()
       }else{
        res.status(403).json({
            message:"You arenot authorized"
        })
       }
    }catch(e:unknown){
        if(e instanceof Error){
            console.error("error:"+e)
            res.status(401).json({
                message:e.message
            })
        }else{
            console.error("error"+e)
            res.status(401).json({
                message:e
            })
        }
    }
}

export default  getUserfromAuthToken