import { Document, model, Schema, Types } from "mongoose";



interface IReview extends Document{
    rideId:Types.ObjectId,
    riderId:Types.ObjectId,
    comment?:string,
    rating:number,
    averageRating:number,
    totalRating:number

}

const ReviewSchema=new Schema<IReview>({
    rideId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    riderId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    comment:{
        type:Schema.Types.ObjectId,
    },
    rating:{
        type:Number,
        required:true
    },
    averageRating:{
        type:Number,
       
    },
    totalRating:{
        type:Number,
    }
},{
    timestamps:true
})

const Review=model<IReview>("Review",ReviewSchema);

export default Review