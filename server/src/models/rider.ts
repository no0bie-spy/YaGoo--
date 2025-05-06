import { Document, model, Types, Schema } from 'mongoose';

interface IRider extends Document {
  userId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  documentId: Types.ObjectId;
  averageRating: number;
  totalRides:number;
}

const riderSchema = new Schema<IRider>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRides:{
      type:Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const Rider = model<IRider>('Rider', riderSchema);

export default Rider;
