import { appointmentModel } from "../Models/AppointmentModel.js";
import { Chat } from "../Models/ChatModel.js";
import { io } from "../server.js";
import { getReceiverSocketId } from "../server.js";
import NodeCache from "node-cache";
import { v2 as cloudinary } from 'cloudinary';

const chatCache = new NodeCache({
  stdTTL: 100,
  checkperiod:60
})


const sendChat = async (req, res) => {
  const { senderId, receiverId, message, image } = req.body;
    
  try {
    let imageURL = null;

    if (image) {
     
      const imageUpload = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      imageURL = imageUpload.secure_url;
    }

    // Save Chat Message
    const chat = new Chat({
      senderId,
      receiverId,
      message,
      image: imageURL, 
    });
    await chat.save();

    const cacheKey = `chat_${senderId}_${receiverId}`;
    chatCache.del(cacheKey);

    
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        senderId,
        message,
        timestamp: new Date(),
        image: imageURL, 
      });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error("Chat send error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const fetchchat = async (req, res) => {
  const { senderId, receiverId } = req.body;
  // console.log({ senderId, receiverId });
  const cacheKey = `chat_${senderId}_${receiverId}`;
  try {

    let cachedChats = chatCache.get(cacheKey);
    if (cachedChats) {
      return res.status(200).json({ success: true, data: cachedChats });
    }

    const response = await Chat.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    if (!response.length) {
      return res.status(404).json({ success: false, message: "No chat available" });
    }

    chatCache.set(cacheKey, response);


    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deletechat = async (req, res) => {
  try {
    const { chatid } = req.body;

    if (!chatid) {
      return res.status(400).json({ success: false, message: "chatid is required" });
    }

    const response = await Chat.findByIdAndUpdate(chatid, { message: "" });

    if (response) {
      io.emit("chatDeleted", chatid);

      // Invalidate the cache for all chats involving this user
      chatCache.keys().forEach((key) => {
        if (key.includes(response.senderId) || key.includes(response.receiverId)) {
          chatCache.del(key);
        }
      });

      return res.status(200).json({ success: true, message: "Data deleted successfully" });
    }
  } catch (error) {
    return res.json({ success: false, message: "Message not deleted" });
  }
};



export { sendChat, fetchchat, deletechat };