import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./Config/MongoDB.js";
import connectCloudinary from "./Config/cloudinary.js";
import adminRouter from "./Routes/adminRoute.js";
dotenv.config();
connectCloudinary();
const app = express();
const port = process.env.PORT || 7000;

// Middleware
app.use(express.json());
app.use(cors());

// end point
app.use('/api/admin',adminRouter);

// localhost:7000

// Routes
app.get('/home', (req, res) => {
  res.send('Hello guys, how are you?');
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
