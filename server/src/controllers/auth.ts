import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RiderDocuments from '../models/riderDocument';
import Vehicle from '../models/vehicle';
import env from '../Ienv';
import { sendRecoveryEmail } from '../services/mailer';
import bcrypt from 'bcryptjs';
import { Otp } from '../models/otp';
import { error } from 'console';

//normal registration
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, fullname, password, phone } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        details: [{ message: 'Email already used' }],
      });
    }

    const missingFields = [
      !email && 'email',
      !fullname && 'fullname',
      !password && 'password',
      !phone && 'phone',
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return res.status(400).json({
        details: [
          {
            message: `Missing required  fields: ${missingFields.join(', ')}`,
          },
        ],
      });
    }
    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 👤 Create user
    const user = await User.create({
      email,
      fullname,
      password: hashedPassword,
      role: 'customer',
      phone,
      isEmailVerified: false,
    });

    // res.status(201).json({
    //   message: 'Registered successfully',
    //   user,info
    // });

    next(email);
    return res.status(201).json({
      details: [
        {
          message: 'Registered successfully',
          user,
        },
      ],
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

//login
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }

    // check password
    const matched = await bcrypt.compare(password, existingUser.password);
    if (!matched) {
      return res
        .status(400)
        .json({ details: [{ message: 'Invalid Email or Password ' }] });
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

//register rider document details
const registerRider = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
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
      vehicleBlueBookPhoto,
    } = req.body;

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

    // multer remaining

    return res.status(200).json({
      message: 'Login successful',
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

//verify email from  OTP
const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, OTP } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        details: [{ message: 'Email Not Found' }],
      });
    }

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({
        details: [{ message: 'Otp Not Found' }],
      });
    }

    const otpValid = await bcrypt.compare(OTP, otpDoc.OTP);
    if (!otpValid) {
      return res.status(400).json({
        details: [{ message: 'Otp isnot Valid' }],
      });
    }

    user.isEmailVerified = true;
    await user.save();
    await Otp.deleteOne({ email });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'OTP matched Successfully',
      user,
      token,
    });
  } catch (e: unknown) {
    console.error('Verify Error', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occured' });
    }
  }
};

//sends OTP message to user
const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }

    // Call the function to send the recovery email
    const { token, info } = await sendRecoveryEmail(email);
    console.log(token, info);

    //hash the otp to save into the database
    const hashedToken = await bcrypt.hash(token, 10);

    const expiryOTP = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 minutes

    await Otp.updateOne(
      { email }, // find by email
      {
        $set: {
          OTP: hashedToken,
          otpExpiresAt: expiryOTP,
        },
      },
      { upsert: true } // insert new if not exists
    );

    return res.status(200).json({
      details: [
        {
          message: 'Otp Sent Successfully',
          existingUser,
        },
      ],
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

const sendOTP = forgotPassword;
//change user password by validating otp sent in respective email
const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, OTP, newPassword, retypePassword } = req.body;

    const existingUser = await User.findOne({ email });

    // check user exists or not
    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User not exist' }] });
    }

    // compare two passwords
    if (newPassword != retypePassword) {
      return res
        .status(400)
        .json({ details: [{ message: 'Password doesnot match' }] });
    }

    //check otp exists or not
    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({
        details: [{ message: 'Otp Not Found' }],
      });
    }

    //validate OTP
    const otpValid = await bcrypt.compare(OTP, otpDoc.OTP);
    if (!otpValid) {
      return res.status(400).json({
        details: [{ message: 'Otp isnot Valid' }],
      });
    }

    //delete OTP after successful OTP validation
    await Otp.deleteOne({ email });

    // hashing  new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    //update the new password
    await User.findOneAndUpdate(
      { email },
      {
        password: newHashedPassword,
      }
    );

    return res.status(200).json({
      details: [
        {
          message: 'Password changed Successfully',
          existingUser,
        },
      ],
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
  verifyEmail,
  registerRider,
  forgotPassword,
  changePassword,
  sendOTP,
};

export default authController;
