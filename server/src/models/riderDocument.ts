import { Document, model, Schema, Types } from "mongoose";


interface rInterface extends Document{
    licenseNumber:string,
    licensePhoto:string,
    citizenshipNumber:string,
    citizenshipPhoto:string,
    isRiderVerified:boolean,
    riderId: Types.ObjectId;
}

const riderDocumentSchema=new Schema<rInterface>({
    licenseNumber:{
        type:String,
        required:true,
        unique:true
    },
    licensePhoto:{
        type:String,
        required:true,
        unique:true
    },
    citizenshipNumber:{
        type:String,
        required:true,
        unique:true
    },
    citizenshipPhoto:{
        type:String,
        required:true,
        unique:true
    },
    isRiderVerified:{
        type:Boolean,
       default:false 
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
},{
    timestamps:true
})

const RiderDocuments=model<rInterface>("RiderDocument",riderDocumentSchema)

export default RiderDocuments