import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)

const db=mongoose.connection;

db.on('connected',()=>{ 
  console.log("MongoDb connected successfully !!");
  
})
db.on('error',(err)=>{
  console.log("MongoDb connected error !!",err);
})
db.on('disconnected',()=>{
  console.log("MongoDb disconnected successfully !!");
})

export default db;