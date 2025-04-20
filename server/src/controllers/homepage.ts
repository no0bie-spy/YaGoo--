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

    // Check if user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    const fullname = existingUser.fullname;
    const role = existingUser.role;
    const phone = existingUser.phone;
    const isEmailVerified = existingUser.isEmailVerified;
    const email = existingUser.email;

    const responseData: any = {
      fullname,
      role,
      phone,
      isEmailVerified,
      email,
    };

    // If the user is a rider, fetch rider-specific details
    if (role === 'rider') {
      const riderDocs = await RiderDocuments.findOne({ riderId: user });
      const vehicle = await Vehicle.findOne({ riderId: user });

      if (riderDocs) {
        responseData.riderDocuments = {
          licenseNumber: riderDocs.licenseNumber,
          citizenshipNumber: riderDocs.citizenshipNumber,
          licensePhoto: riderDocs.licensePhoto,
          citizenshipPhoto: riderDocs.citizenshipPhoto,
        };
      }

      if (vehicle) {
        responseData.vehicle = {
          vehicleType: vehicle.vehicleType,
          vehicleName: vehicle.vehicleName,
          vehicleModel: vehicle.vehicleModel,
          vehicleNumberPlate: vehicle.vehicleNumberPlate,
          vehiclePhoto: vehicle.vehiclePhoto,
          vehicleNumberPlatePhoto: vehicle.vehicleNumberPlatePhoto,
          vehicleBlueBookPhoto: vehicle.vehicleBlueBookPhoto,
        };
      }
    }

    return res.status(200).json({
      message: 'User details shown',
      user: responseData,
    });
  } catch (e: unknown) {
    console.error('Error fetching user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// edit profile details
const editProfileDetails = async (req: IRequest, res: Response, next: NextFunction) => {
  try {

    const user = req.userId; // get user from the middleware token

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user exists
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        details: [{ message: 'User does not exist' }],
      });
    }

    // modify user data
    const { fullname, phone, email} = req.body;

    const updatedData = await User.findByIdAndUpdate(user,  { email, fullname, phone },
      { new: true } // `new: true` returns the updated document
    );


    

    return res.status(200).json({
      message: 'User Details Updated Successfully',
       user: updatedData, // to shown if necessary
    });
  } catch (e: unknown) {
    console.error('Error fetching user details:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};



const homepageController = {
  userDetails,
  editProfileDetails
};

export default homepageController;

