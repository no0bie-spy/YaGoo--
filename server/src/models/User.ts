import { Document, model, Schema } from 'mongoose';

export type UserRole = 'customer' | 'rider' | 'admin';

interface IUser extends Document {
  email: string;
  fullname: string;
  password: string;
  role: UserRole;
  phone: string;
  isEmailVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'rider', 'admin'],
      default: 'customer',
    },
    fullname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false 
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>('User', userSchema);

export default User;
