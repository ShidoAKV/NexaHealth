import mongoose, { Schema } from "mongoose";

const chatSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  message: {
    type:String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Chat = mongoose.model("Chat", chatSchema);
