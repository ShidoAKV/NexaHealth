import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./Config/MongoDB.js";
import connectCloudinary from "./Config/cloudinary.js";
import adminRouter from "./Routes/adminRoute.js";
import doctorRouter from "./Routes/doctorRoute.js";
import userRouter from "./Routes/UserRoute.js";
import { Server } from "socket.io";
import { createServer } from "http";
import chatRouter from "./Routes/ChatRoute.js";

dotenv.config();
connectCloudinary();

const app = express();
const port = process.env.PORT || 7000;

const server =createServer(app);

const io = new Server(server, {
  cors: {
    origin:[process.env.FRONTEND_USER_URL,process.env.FRONTEND_DOCTOR_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000, 
  pingInterval: 25000,
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/chat",chatRouter);


app.get("/home", (req, res) => {
  res.send("Server is up and running!");
});

// Socket.io logic


const appointmenttoSocketMap = {};

// Helper function to get socket ID of the receiver
const getReceiverSocketId = (receiverId) => {
  return appointmenttoSocketMap[receiverId];
};

io.on('connection', (socket) => {
    // console.log('User connected:', socket.id);

  const appointmentData = socket.handshake.query;

  if (appointmentData) {

    if (appointmentData.docId) {
      appointmenttoSocketMap[appointmentData.docId] = socket.id;
      // console.log(`Mapped Doctor ID: ${appointmentData.docId} to Socket ID: ${socket.id}`);
    }
    if (appointmentData.userId) {
       appointmenttoSocketMap[appointmentData.userId] = socket.id;
      // console.log(`Mapped User ID: ${appointmentData.userId} to Socket ID: ${socket.id}`);
    }
  } else {
    console.log('No valid appointment data in socket handshake query.');
  }

  // Handle disconnect
  socket.on('disconnect', () => {
     console.log('User disconnected:', socket.id);
    // Remove the socket from the mapping
    for (const [key, value] of Object.entries(appointmenttoSocketMap)) {
      if (value === socket.id) {
        delete appointmenttoSocketMap[key];
        // console.log(`Removed mapping for ${key}`);
        break;
      }
    }
  });
});






server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export {io,getReceiverSocketId};