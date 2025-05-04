import { NextFunction, Request, Response } from "express";
import IRequest from "../middleware/IRequest";
import { Otp } from "../models/otp";
import User from "../models/User";


const viewEmail = async function (req : IRequest, res: Response) {
    
    try{
        const userId = req.userId;
       
        if (!userId) {
          return res.status(400).json({
            details: [{ message: 'User ID is missing' }],
          });
        }

        const userDoc = await User.findById(userId);

        if (!userDoc) {
                return res.status(400).json({
                    details: [{ message: 'User Document  is missing' }],
                  });
            }

           
        const otpRecord = await Otp.findOne({ email: userDoc.email })
        
        const validOtp = otpRecord?.OTP;

       
        const validEmail = otpRecord?.email;

        return res.json({
            message : " otp shown",
            otp: validOtp,
            email : validEmail
        })

    
    }
    catch (e: unknown) {
        console.error('Register error:', e);
        if (e instanceof Error) {
          return res.status(500).json({ message: e.message });
        } else {
          return res.status(500).json({ message: 'An unknown error occurred' });
        }
      }
    };
    
    const suyanController = {
        viewEmail
    }

    export default suyanController
