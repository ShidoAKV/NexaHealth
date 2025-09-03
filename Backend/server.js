import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from 'express-rate-limit';
import db from "./Config/MongoDB.js";
import connectCloudinary from "./Config/cloudinary.js";
import adminRouter from "./Routes/adminRoute.js";
import doctorRouter from "./Routes/doctorRoute.js";
import userRouter from "./Routes/UserRoute.js";
import { Server } from "socket.io";
import { createServer } from "http";
import chatRouter from "./Routes/ChatRoute.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

dotenv.config();
connectCloudinary();

const app = express();
const port = process.env.PORT || 7000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_USER_URL, process.env.FRONTEND_DOCTOR_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRouter, limiter);
app.use("/api/doctor", doctorRouter, limiter);
app.use("/api/user", userRouter, limiter);
app.use("/api/chat", chatRouter);


app.get("/home", (req, res) => {
  res.send("Server is up and running!");
});

// Socket.io logic

const appointmenttoSocketMap = {};
const doctorToUsers = {};
const userToDoctors = {};
const videocallrequests = {};
const getReceiverSocketId = (receiverId) => {
  return appointmenttoSocketMap[receiverId];
};



io.on("connection", (socket) => {
  const { userId, docId, message } = socket.handshake.query;
  if (userId) {
    appointmenttoSocketMap[userId] = socket.id;
  }
  if (docId) {
    appointmenttoSocketMap[docId] = socket.id;
  }


 if (message === "make_video_call") {
    if (userId) videocallrequests[userId] = socket.id;
    if (docId) videocallrequests[docId] = socket.id;
  }
  
  socket.on("register-chat", (data) => {

    if (userId && docId) {

      if (!doctorToUsers[docId]) {
        doctorToUsers[docId] = new Set();
      }
      doctorToUsers[docId].add(userId);


      if (!userToDoctors[userId]) {
        userToDoctors[userId] = new Set();
      }
      userToDoctors[userId].add(docId);

      // Broadcast doctor's online status to every user registered with that doctor.
      if (appointmenttoSocketMap[docId]) {
        doctorToUsers[docId].forEach((uid) => {
          if (appointmenttoSocketMap[uid]) {
            io.to(appointmenttoSocketMap[uid]).emit("status-update", {
              userId: docId, // indicating the doctor’s id
              status: "online",
            });
          }
        });
      }

      // Similarly, broadcast user's online status to every doctor registered with that user.
      if (appointmenttoSocketMap[userId] && userToDoctors[userId]) {
        userToDoctors[userId].forEach((did) => {
          if (appointmenttoSocketMap[did]) {
            io.to(appointmenttoSocketMap[did]).emit("status-update", {
              userId: userId, // indicating the user's id
              status: "online",
            });
          }
        });
      }
    }
  });

  socket.on("video-initiat", (data) => {
    const { userId, docId,patientpeerId, doctorpeerId, direction } = data;

    if (direction === "user_to_doctor" && videocallrequests[docId]) {
      io.to(videocallrequests[docId]).emit("get-peerId", {
        doctorPeerId:doctorpeerId,
        userPeerId:patientpeerId,
        message: "user_peer_id",
      });
    }else if (direction === "doctor_to_user" && videocallrequests[userId]) {
      io.to(videocallrequests[userId]).emit("get-peerId", {
        doctorPeerId:doctorpeerId,
        userPeerId:patientpeerId,
        message: "doctor_peer_id",
      });
    }
  });

 
  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);
    let disconnectedId = null;

    // Find the id (user or doctor) that matches this socket.
    for (const [id, sId] of Object.entries(appointmenttoSocketMap)) {
      if (sId === socket.id) {
        disconnectedId = id;
        delete appointmenttoSocketMap[id];
        break;
      }
    }

    for (const [id, sId] of Object.entries(videocallrequests)) {
      if (sId === socket.id) {
        delete videocallrequests[id];
        break;
      }
    }
    // for (const key of Object.keys(videoPeerMap)) {
    //   if (key.includes(disconnectedId)) {
    //     delete videoPeerMap[key];
    //   }
    // }

    if (disconnectedId) {
      // If the disconnected id is a doctor, broadcast offline to all paired users.
      if (doctorToUsers[disconnectedId]) {
        doctorToUsers[disconnectedId].forEach((uid) => {
          if (appointmenttoSocketMap[uid]) {
            io.to(appointmenttoSocketMap[uid]).emit("status-update", {
              userId: disconnectedId,
              status: "offline",
            });
          }
        });
        delete doctorToUsers[disconnectedId];
      }
      // If the disconnected id is a user, broadcast offline to all paired doctors.
      if (userToDoctors[disconnectedId]) {
        userToDoctors[disconnectedId].forEach((did) => {
          if (appointmenttoSocketMap[did]) {
            io.to(appointmenttoSocketMap[did]).emit("status-update", {
              userId: disconnectedId,
              status: "offline",
            });
          }
        });
        delete userToDoctors[disconnectedId];
      }
    }
  });
});



server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { io, getReceiverSocketId };