
import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  otpExpiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, unique: true, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // deletes document when this time is reached
  },
  
  createdAt: { type: Date, default: Date.now },
});

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
