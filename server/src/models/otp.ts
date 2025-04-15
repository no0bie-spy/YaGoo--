import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: mongoose.Types.ObjectId;
  otp: string;
  otpExpiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
