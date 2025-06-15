import { Document, model, Schema, Types } from "mongoose";

interface IRoom extends Document{
    slug :string;
    adminId:Types.ObjectId;
   chat: Types.ObjectId[];
}

const RoomSchema=new Schema<IRoom>({
    slug:{
        type:String,
        required:true,
        unique:true
    },
    adminId:{
        type:Schema.Types.ObjectId,
        required:true
    },
    chat:[
        {
            type:Schema.Types.ObjectId,
            ref:"Chat",
            required:true
        }
    ]
},{
    timestamps:true
})

const Room=model<IRoom>("Room",RoomSchema)
export default Room