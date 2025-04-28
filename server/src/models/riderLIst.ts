
import {model, Schema, Types } from 'mongoose'

interface IRiderList extends Document{
    riderId:Types.ObjectId,
    rideId:Types.ObjectId,
    status:
    | 'accepted'
    | 'not-accepted',
}

const RiderListSchema= new Schema <IRiderList>({
    riderId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    rideId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        enum:['accepted','not-accepted'],
        default:'not-accepted'
    }
},{
    timestamps:true
})

const RiderList= model <IRiderList>('RideList',RiderListSchema)


export default RiderList