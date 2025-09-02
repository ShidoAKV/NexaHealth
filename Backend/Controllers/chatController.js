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

    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error("Chat send error:", error);
    return res.status(500).json({ error: "Internal server error" });
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


    return res.json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal server error" });
  }
};

const deletechat = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.json({ success: false, message: "senderId and receiverId are required" });
    }
    
    
    chatCache.keys().forEach((key) => {
      if (key.includes(senderId) || key.includes(receiverId)) {
        chatCache.del(key);
      }
    });


    
    const chat = await Chat.deleteMany({
      $or: [
        { senderId,receiverId },
      ]
    });
    
   
    
    return res.json({ success: true, message: "Chat cleared successfully" });

  } catch (error) {
    return res.json({ success: false, message: "Internal server error" });
  }
};

const sendPdf = async (req, res) => {
  const { senderId, receiverId } = req.body;
   
  try {
    let pdfUrl = null;
   

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto", 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      pdfUrl = result.secure_url;
    }
   
    const chat = new Chat({
      senderId,
      receiverId,
      message:'nexahealthpdf',
      pdf:pdfUrl,
    });
    await chat.save();

    const cacheKey = `chat_${senderId}_${receiverId}`;
    chatCache.del(cacheKey);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        senderId,
        message:'nexahealthpdf',
        timestamp: new Date(),
        pdf:pdfUrl,
      });
    }

    return res.json({ success: true, data: chat });
  } catch (error) {
    console.error("Chat send error:", error);
    return res.json({ success: false, error: "Something went wrong." });
  }
};

export { sendChat, fetchchat, deletechat,sendPdf};