import { Schema, model, Types, Document } from 'mongoose';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  coordinates: Coordinates;
}

interface IRide extends Document {
  customerId: Types.ObjectId;
  rider?: Types.ObjectId;
  start_location: Location;
  destination: Location;
  otp_start: string;
  status: 'not-started' | 'requested' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
  distance: number;
  minimumPrice: number;
  createdAt: Date;  
  updatedAt: Date;
}


const coordinatesSchema = new Schema<Coordinates>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { _id: false });

const locationSchema = new Schema<Location>({
  address: { type: String, required: true },
  coordinates: { type: coordinatesSchema, required: true },
}, { _id: false });

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
      type: locationSchema,
      required: true,
    },
    destination: {
      type: locationSchema,
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
    distance: {
      type: Number,
      required: true,
    },
    minimumPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);


const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
