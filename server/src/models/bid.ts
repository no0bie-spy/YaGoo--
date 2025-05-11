import { Schema, model, Types, Document } from 'mongoose';

interface IBid extends Document {
  _id: Types.ObjectId;
  rideId: Types.ObjectId; 
  userId: Types.ObjectId;
  amount: number; 
  createdAt: Date;
}

const bidSchema = new Schema<IBid>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    userId: {
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
