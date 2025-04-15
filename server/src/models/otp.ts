import mongoose, { Document, Schema, Model } from 'mongoose';

interface IOtp extends Document {
  email: mongoose.Types.ObjectId;
  otp: string;
  otpExpiresAt: Date;
  createdAt: Date;
}

const otpSchema: Schema<IOtp> = new mongoose.Schema({
  email: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Otp: Model<IOtp> = mongoose.model<IOtp>('Otp', otpSchema);
