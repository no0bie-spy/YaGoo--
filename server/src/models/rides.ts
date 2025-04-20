import { Schema, model, Types, Document } from 'mongoose';

interface IRide extends Document {
  customer: Types.ObjectId;
  rider?: Types.ObjectId;
  origin: string;
  destination: string;
  fare: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
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
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
