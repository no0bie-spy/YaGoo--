import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';
import env from '../Ienv';
import { sendRecoveryEmail } from '../services/mailer';
import bcrypt from "bcryptjs"; 
import { Otp } from '../models/otp';
import { error } from 'console';
import IRequest from '../middleware/IRequest';

//normal registration
const userDetails = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
   const user = req.userId;
   
   if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
    // Check if user with this email already exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User doesnot exist ' }],
      });
    }

    const fullname = existingUser.fullname;
    const role = existingUser.role;
    const phone = existingUser.phone;
    const isEmailVerified = existingUser.isEmailVerified;


  return res.status(200).json({
  message: 'User details shown',
  user: {
    fullname,
    role,
    phone,
    isEmailVerified
  }
});

  } catch (e: unknown) {
    console.error('Register error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};




const homepageController = {
  userDetails,
 
};

export default homepageController;

