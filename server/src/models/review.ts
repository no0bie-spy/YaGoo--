import { Document, model, Schema, Types } from "mongoose";

interface IReview extends Document {
  rideId: Types.ObjectId;
  riderId: Types.ObjectId;
  comment?: string;
  rating: number;
}

const ReviewSchema = new Schema<IReview>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Ride",
    },
    riderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comment: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

const Review = model<IReview>("Review", ReviewSchema);

export default Review;
