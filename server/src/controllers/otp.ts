import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { sendNormalRegistrationEmail } from '../services/mailer';
import { Otp } from '../models/otp';
import User from '../models/User';


// Send OTP to reset password
const sendRegisterOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ details: [{ message: 'User does not exist' }] });
    }

    // Call the function to send the recovery email
    const { token, info } = await sendNormalRegistrationEmail(email);
    console.log(token, info);

    // Hash the OTP to save into the database
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
    console.error('Send OTP error:', e);
    if (e instanceof Error) {
      return res.status(500).json({ message: e.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

const otpController = {
    sendRegisterOtp,
  };

export default otpController;
