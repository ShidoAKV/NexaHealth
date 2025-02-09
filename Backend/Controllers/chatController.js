import { appointmentModel } from "../Models/AppointmentModel.js";
import { Chat } from "../Models/ChatModel.js";
import { io } from "../server.js";
 import { getReceiverSocketId } from "../server.js";

 const sendChat = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  try {
    const chat =new Chat({
      senderId,
      receiverId,
      message,
    });
     await chat.save();
  
    

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        senderId,
        message,
        timestamp: new Date(),
      });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const fetchchat = async (req, res) => {
  const { senderId, receiverId } = req.body;
  // console.log({ senderId, receiverId });

  try {
    const response = await Chat.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }, 
      ],
    }).sort({ createdAt: 1 }); 

    if (!response.length) {
      return res.status(404).json({ success: false, message: "No chat available" });
    }
    // console.log(response);
    

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const deletechat=async(req,res)=>{
   try {
    const { chatid } = req.body;
      
    if (!chatid) {
      return res.status(400).json({ success: false, message: 'chatid is required' });
    }
  
    const response = await Chat.findByIdAndUpdate(chatid,{message:''});
    
    if(response){
      io.emit('chatDeleted',chatid);
      return res.status(200).json({ success: true, message: 'Data deleted successfully' });
    }
 
   } catch (error) {
     return res.json({success:false,message:'message not deleted '});
   }


}

export {sendChat,fetchchat,deletechat};