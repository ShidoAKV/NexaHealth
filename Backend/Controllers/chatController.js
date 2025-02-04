import { appointmentModel } from "../Models/AppointmentModel.js";
import { Chat } from "../Models/ChatModel.js";
import { io } from "../server.js";
 import { getReceiverSocketId } from "../server.js";

const sendChat=async(req,res)=>{
    const { appointmentId, senderId, receiverId, message } = req.body;
    try {
      // Validate if the appointment exists
      const appointment = await appointmentModel.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      // Create a new message
      const newMessage = new Chat({
        appointmentId,
        senderId,
        receiverId,
        message,
      });
  
      await newMessage.save();
     
      const receiverSocketId = getReceiverSocketId(receiverId);
      console.log('Receiver Socket ID:', receiverSocketId);
  
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        // console.log('Message sent to receiver:', receiverSocketId);
      } else {
        console.log('Receiver is not connected.');
      }
  
      res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
}

const fetchchat=async(req,res)=>{
    const { appointmentId}=req.body;
    
    //  console.log(req.body);
    
    try {
      // Validate if the appointment exists
      const appointment = await appointmentModel.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      // Fetch messages for the appointment
      const messages = await Chat.find({ appointmentId }).sort({ timestamp: 1 });
  
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
}

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