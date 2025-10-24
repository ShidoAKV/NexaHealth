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
import cron from 'node-cron';
import { appointmentModel } from "./Models/AppointmentModel.js";
import moment from "moment";

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
app.use(express.static("build", {
  maxAge: "15m",   // cache static assets for 1 year
  etag: false
}));
app.set('trust proxy', 1);
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
const onlineUsers = new Map();
const notificationOnlineUsers = new Map();

const getReceiverSocketId = (receiverId) => {
  return appointmenttoSocketMap[receiverId];
};


io.on("connection", (socket) => {
  const { userId, docId, message, notificationdata } = socket.handshake.query;

  if (userId) {
    appointmenttoSocketMap[userId] = socket.id;
  }

  if (docId) {
    onlineUsers.set(docId, socket.id);
    appointmenttoSocketMap[docId] = socket.id;
    io.emit("online-users", Array.from(onlineUsers.keys()));
  }

  if (notificationdata && userId) {
    notificationOnlineUsers.set(userId, socket.id);
    console.log(`🟢 Notification socket registered for user ${userId}`);
  }


  socket.on("online-register", ({ personId }) => {
    if (!personId) return;

    onlineUsers.set(personId, {
      socketId: socket.id,
      status: "online",
    });


    io.emit(
      "online-users",
      Array.from(onlineUsers.entries()).map(([id, data]) => ({
        userId: id,
        status: data.status,
      }))
    );


  })


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
    const { userId, docId, patientpeerId, doctorpeerId, direction } = data;

    if (direction === "user_to_doctor" && videocallrequests[docId]) {
      io.to(videocallrequests[docId]).emit("get-peerId", {
        doctorPeerId: doctorpeerId,
        userPeerId: patientpeerId,
        message: "user_peer_id",
      });
    } else if (direction === "doctor_to_user" && videocallrequests[userId]) {
      io.to(videocallrequests[userId]).emit("get-peerId", {
        doctorPeerId: doctorpeerId,
        userPeerId: patientpeerId,
        message: "doctor_peer_id",
      });
    }
  });

  socket.on("removeUser", (userId) => {
    if (notificationOnlineUsers.has(userId)) {
      // console.log('remove function called', userId);

      notificationOnlineUsers.delete(userId);
    }
  });


  socket.on("disconnect", () => {

    let disconnectedId = null;

    // 1️⃣ Find the user/doctor ID linked to this socket
    for (const [id, sId] of Object.entries(appointmenttoSocketMap)) {
      if (sId === socket.id) {
        disconnectedId = id;
        delete appointmenttoSocketMap[id];
        break;
      }
    }

    // 2️⃣ Also remove from video call map if exists
    for (const [id, sId] of Object.entries(videocallrequests)) {
      if (sId === socket.id) {
        delete videocallrequests[id];
        break;
      }
    }

    // 3️⃣ Remove from notification socket map if exists

    for (const [id, sId] of notificationOnlineUsers.entries()) {
      if (sId === socket.id) {
        notificationOnlineUsers.delete(id);
        // console.log(`🔴 Removed ${id} from notificationOnlineUsers`);
        break;
      }
    }



    // 4️⃣ Handle status updates (doctor ↔ users)
    if (disconnectedId) {
      // If doctor disconnected → mark offline for all users who had them
      if (doctorToUsers[disconnectedId]) {
        doctorToUsers[disconnectedId].forEach((uid) => {
          const socketId = appointmenttoSocketMap[uid];
          if (socketId) {
            io.to(socketId).emit("status-update", {
              userId: disconnectedId,
              status: "offline",
            });
          }
        });
        delete doctorToUsers[disconnectedId];
      }

      // If user disconnected → mark offline for all their doctors
      if (userToDoctors[disconnectedId]) {
        userToDoctors[disconnectedId].forEach((did) => {
          const socketId = appointmenttoSocketMap[did];
          if (socketId) {
            io.to(socketId).emit("status-update", {
              userId: disconnectedId,
              status: "offline",
            });
          }
        });
        delete userToDoctors[disconnectedId];
      }
    }

    // 5️⃣ Update global online users list cleanly
    let updated = false;
    for (const [id, data] of onlineUsers.entries()) {
      if (data.socketId === socket.id) {
        onlineUsers.set(id, { socketId: null, status: "offline" });
        updated = true;
        break;
      }
    }

    // 6️⃣ Emit updated online users list if needed
    if (updated) {
      io.emit(
        "online-users",
        Array.from(onlineUsers.entries()).map(([id, data]) => ({
          userId: id,
          status: data.status,
        }))
      );
    }
  });


});


cron.schedule("0 */6 * * *", async () => {

  const appointments = await appointmentModel.find({
    payment: true
  }).populate("userId docData");

  for (const appt of appointments) {
    const appointmentDate = moment(appt.slotDate, "D_M_YYYY");
    const today = moment().startOf("day");
    const daysLeft = appointmentDate.diff(today, "days");
    const socketId = notificationOnlineUsers.get(appt.userId.toString());

    // Condition: appointment is in future or today, payment done, and not yet notified
      // console.log(socketId);
    //  console.log(notificationOnlineUsers);


    if (daysLeft >= 0 && appt.payment && appt.notificationSent === false ) {
      if (socketId) {
         
        io.to(socketId).emit("appointmentNotification", {
          title: "Appointment Reminder",
          message:
            daysLeft === 0
              ? `Your appointment with Dr. ${appt.docData?.name} is today at ${appt.slotTime}.`
              : `Your appointment with Dr. ${appt.docData?.name} is in ${daysLeft} day(s).`,
          appointmentId: appt._id,
        });
        // console.log(`📨 Notification sent to user ${appt.userId}`);
      }
    } else {
     
      // Mark notificationSent true if still false
      if (!appt.notificationSent) {
        await appointmentModel.updateOne(
          { _id: appt._id },
          { $set: { notificationSent: true } }
        );
      }
    }
  }
});


server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { io, getReceiverSocketId };