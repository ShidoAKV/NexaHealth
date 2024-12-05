import validator from "validator";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";
import { doctorModel } from "../Models/Doctormodel.js";
import jwt from "jsonwebtoken";

// Api for adding doctor

const addDoctor=async(req,res)=>{
    try {
         const {name,email,password,speciality,degree,experience,about,fees,address}=req.body;
         const imageFile=req.file;

         // checking for all data

      if(!name||!email||!password||!degree||!speciality||!address||!about||!fees||!experience){
         return res.json({success:"false",message:"missing details"})
      }   

       // validating email format
      if(!validator.isEmail(email)){
        return res.json({success:"false",message:"please enter a valid email"})
      }
      if(password.length<8){
        return res.json({success:"false",message:"please enter a strong password"})
      }

      //hashing the password
      const salt=await bcrypt.genSalt(10);
      const hashedpassword=await bcrypt.hash(password,salt);

    //    const imageupload=await cloudinary.uploader.upload(
    //      imageFile.path,{resource_type:"image"}
    //    )
    const imageupload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "doctors", // Optional: organize uploads into folders
      });

     const imageurl=imageupload.secure_url;

      // json.parsed used to convert the object into string 
     const doctorData={
        name,
        email,
        image:imageurl,
        password:hashedpassword,
        speciality,
        degree,
        about,
        fees,
        address:JSON.parse(address),
        experience,
        date:Date.now()
     }

     const newDoctor=new doctorModel(doctorData);
     await newDoctor.save();
     
     res.json({success:"true",message:"data added successfully"})

    } catch (error) {
        console.log(error);
        res.json({success:"false",message:error.message}) ;
        
    }
}

// API for login admin

const loginAdmin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(email=== process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
           const token=jwt.sign(
            process.env.ADMIN_EMAIL,process.env.JWT_SECRET);
           res.json({success:"true",token});
        }else{
            res.json({success:"false",message:"invalid credentials"})
        }
       
        
    } catch (error) {
        console.log(error);
        res.json({success:"login failes",message:error.message}) ;
    }
}


export {addDoctor,loginAdmin};