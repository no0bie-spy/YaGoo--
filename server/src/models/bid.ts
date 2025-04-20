import { Schema, model, Types, Document } from 'mongoose';

interface IBid extends Document {
  ride: Types.ObjectId; // Reference to the ride being bid on
  rider: Types.ObjectId; // Rider who placed the bid
  amount: number; // Bid amount by the rider
  createdAt: Date; // Timestamp when the bid was placed
}

const bidSchema = new Schema<IBid>(
  {
    ride: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    rider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } 
);

const Bid = model<IBid>('Bid', bidSchema);

export default Bid;
