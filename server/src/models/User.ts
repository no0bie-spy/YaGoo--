import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'customer' | 'rider' | 'admin';

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone: string;
  // Rider specific fields
  licenseNumber?: string;
  bikeNumberPlate?: string;
  bikeModel?: string;
  // Method to compare password
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
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
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: function (this: IUser) {
        return this.role === 'rider';
      },
    },
    bikeNumberPlate: {
      type: String,
      required: function (this: IUser) {
        return this.role === 'rider';
      },
    },
    bikeModel: {
      type: String,
      required: function (this: IUser) {
        return this.role === 'rider';
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);