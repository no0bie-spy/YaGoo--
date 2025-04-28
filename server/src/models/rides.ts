
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
<<<<<<< HEAD
  status:
    | 'not-started'
    | 'requested'
    | 'matched'
    | 'in-progress'
    | 'completed'
    | 'cancelled';
  distance: number;
  minimumPrice: number;
  bidId: Types.ObjectId;
  createdAt: Date;
=======
  status: 'not-started' | 'requested' | 'matched' | 'in-progress' | 'completed' | 'cancelled';
<<<<<<< HEAD
  createdAt: Date;
=======
  distance: number;
  minimumPrice: number;
  createdAt: Date;  
>>>>>>> 7b89f3686c2b73f9ece0983631c9cd7b815d118b
>>>>>>> refs/remotes/origin/main
  updatedAt: Date;
  bids: Types.ObjectId[];  // Add this field to hold bid references
}

const coordinatesSchema = new Schema<Coordinates>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const locationSchema = new Schema<Location>(
  {
    address: { type: String, required: true },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { _id: false }
);

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
      enum: [
        'not-started',
        'requested',
        'matched',
        'in-progress',
        'completed',
        'cancelled',
      ],
      default: 'requested',
    },
<<<<<<< HEAD
    bids: [{
      type: Schema.Types.ObjectId,
      ref: 'Bid',
    }],
=======
    distance: {
      type: Number,
      required: true,
    },
    minimumPrice: {
      type: Number,
      required: true,
    },
<<<<<<< HEAD
    bidId: {
      type: Schema.Types.ObjectId,
    },
=======
>>>>>>> 7b89f3686c2b73f9ece0983631c9cd7b815d118b
>>>>>>> refs/remotes/origin/main
  },
  { timestamps: true }
);

const Ride = model<IRide>('Ride', rideSchema);

export default Ride;
