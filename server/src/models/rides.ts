import { Schema, model, Types, Document } from 'mongoose';

interface IRide extends Document {
  customerId: Types.ObjectId;
  rider?: Types.ObjectId;
  start_location: string;
  destination: string;
  otp_start: string;
  status: 'not-started' | 'requested' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  bids: Types.ObjectId[];  // Add this field to hold bid references
}

const rideSchema = new Schema<IRide>(
  {
    customerId: {
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
    },
    status: {
      type: String,
      enum: ['not-started', 'requested', 'matched', 'in-progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    bids: [{
      type: Schema.Types.ObjectId,
      ref: 'Bid',
    }],
  },
  { timestamps: true }
);

const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
