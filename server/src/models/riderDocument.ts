import { Document, Schema } from "mongoose";


interface rInterface extends Document{
    licenseNumber:string,
    licensePhoto:string,
    citizenshipNumber:string,
    citizenshipPhoto:string,
    isRiderVerified:boolean
}

const riderDocumentSchema=new Schema({

})