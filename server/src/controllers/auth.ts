import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';
import env from '../Ienv';
import { sendRecoveryEmail } from '../services/mailer';
import bcrypt from "bcryptjs"; 
import { Otp } from '../models/otp';

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email,
      fullname,
      password,
      role,
      phone,
      licenseNumber,
      licensePhoto,
      citizenshipNumber,
      citizenshipPhoto,
      vehicleType,
      vehicleName,
      vehicleModel,
      vehiclePhoto,
      vehicleNumberPlate,
      vehicleNumberPlatePhoto,
      vehicleBlueBookPhoto
    } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        details: [{ message: 'Email already used' }],
      });
    }

    // 🚫 Check for rider-specific fields
    if (role === 'rider') {
      const missingFields = [
        !licenseNumber && 'licenseNumber',
        !licensePhoto && 'licensePhoto',
        !citizenshipNumber && 'citizenshipNumber',
        !citizenshipPhoto && 'citizenshipPhoto',
        !vehicleType && 'vehicleType',
        !vehicleName && 'vehicleName',
        !vehicleModel && 'vehicleModel',
        !vehiclePhoto && 'vehiclePhoto',
        !vehicleNumberPlate && 'vehicleNumberPlate',
        !vehicleNumberPlatePhoto && 'vehicleNumberPlatePhoto',
        !vehicleBlueBookPhoto && 'vehicleBlueBookPhoto',
      ].filter(Boolean);

      if (missingFields.length > 0) {
        return res.status(400).json({
          details: [
            {
              message: `Missing required rider fields: ${missingFields.join(
                ', '
              )}`,
            },
          ],
        });
      }
    }

    // 👤 Create user
    const user = await User.create({
      email,
      fullname,
      password,
      role,
      phone,
      isEmailVerified: false,
    });

    // 🛵 If rider, attach vehicle and documents
    if (role === 'rider') {
      await Vehicle.create({
        vehicleType,
        vehicleName,
        vehicleModel,
        vehiclePhoto,
        vehicleNumberPlate,
        vehicleNumberPlatePhoto,
        vehicleBlueBookPhoto,
        riderId: user._id,
      });

      await RiderDocuments.create({
        licenseNumber,
        licensePhoto,
        citizenshipNumber,
        citizenshipPhoto,
        isRiderVerified: false,
        riderId: user._id,
      });
    }


      // Call the function to send the recovery email
       const { token, info} = await sendRecoveryEmail(email);
  
      //hash the otp to save into the database
      const hashedToken = await bcrypt.hash(token,10);

      const expiryOTP = new Date(Date.now()+ 10*60*1000); // valid for 10 minutes

      const  otpSaved = new Otp({
        email: email,
        otp: hashedToken,
        otpExpiresAt: expiryOTP,
       })

       
  //save otp for the respective user
  await otpSaved.save();

    res.status(201).json({
      message: 'Registered successfully',
      user,info
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

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '7d' }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         role: user.role,
//         name: user.name,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({ error: 'Login failed' });
//   }
// };

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email, password });

    if (!existingUser) {
      return res
        .status(400)
        .json({ details: [{ message: 'Email already used' }] });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
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

const authController = {
  register,
  login,
};

export default authController;

