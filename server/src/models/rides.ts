import { Schema, model, Types, Document } from 'mongoose';

interface IRide extends Document {
  customer: Types.ObjectId;
  rider?: Types.ObjectId;
  start_location: string;
  destination: string;
  otp_start: string;
  status: 'requested' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;  
  updatedAt: Date;
}

const rideSchema = new Schema<IRide>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    start_location: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    otp_start: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['requested', 'matched', 'in-progress', 'completed', 'cancelled'],
      default: 'requested',
    },
  },
  { timestamps: true }
);

const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
