
import {Schema, Types } from 'mongoose'

interface IRiderList extends Document{
    riderId:Types.ObjectId,
    rideId:Types.ObjectId,
    status:
    | 'accepted'
    | 'not-accepted',
}

const RiderList= new Schema <IRiderList>({
    riderId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    rideId:{
        type:Schema.Types.ObjectId,
        required:true
    }
})