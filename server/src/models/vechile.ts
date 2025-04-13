import { timeStamp } from "console";
import { Document, Types } from "mongoose";


type vType="bike"| "scooter"|"car"|"others"

interface vInteface extends Document{
    vehicleType:vType,
    vehicleName:string,
    vehicleModel:string,
    vehiclePhoto:string,
    vehicleNumberPlate:string,
    vehicleNumberPlatePhot:string,
    vehicleBlueBookPhoto:string,
    isVehicleVerified:boolean,
    riderId:Types.ObjectId[];
}

const vechileSchema=new Schema <vInteface>({
    vehicleType:{
        type:String,
        required:true
    },
    vehicleName:{
        type:String,
        required:true
    },
    vehicleModel:{
        type:String,
        required:true
    },vehiclePhoto:{
        type:String,
        required:true,
        unique:true
    },
    vehicleNumberPlate:{
        type:String,
        required:true,
        unique:true
    },
    vehicleNumberPlatePhoto:{
        type:String,
        required:true,
        unique:true
    },
    vehicleBlueBookPhoto:{
        type:String,
        required:true,
        unique:true
    },
    isVehicleVerified:{
        type:Boolean,
    },
    riderId:{
        type:Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    }
},{
    timeStamp:true
})

co