import { Document, model, Mongoose, Schema, Types } from "mongoose";



interface IReview extends Document{
    rideId:Types.ObjectId,
    riderId:Types.ObjectId,
    comment?:string,
    rating:string
}

const ReviewSchema=new Schema<IReview>({
    rideId:{
        types:Schema.Types.ObjectId,
        required:true
    },
    riderId:{
        types:Schema.Types.ObjectId,
        required:true
    },
    comment:{
        types:Schema.Types.ObjectId,
    },
    rating:{
        types:String,
        required:true
    }
},{
    timestamps:true
})

const Review=model<IReview>("Review",ReviewSchema);

export default Review