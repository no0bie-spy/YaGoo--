import { Document, Schema, Types, model } from "mongoose";

// Interface
export interface IChat extends Document {
  message: string;
  userId: Types.ObjectId;
  roomId: Types.ObjectId;
  createdAt: Date;
}

// Schema
const ChatSchema = new Schema<IChat>({
  message: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", // reference to User model
    required: true,
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room", // reference to Room model
    required: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false } // only createdAt
});


const Chat = model<IChat>("Chat", ChatSchema);

export default Chat