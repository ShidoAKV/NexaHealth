import validator from "validator";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";
import { doctorModel } from "../Models/Doctormodel.js";
import jwt from "jsonwebtoken";
import { appointmentModel } from "../Models/AppointmentModel.js";
import { UserModel } from "../Models/UserModel.js";

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

      const doctor=await doctorModel.findOne({email:email});
      if(doctor){
        return res.json({success:"false",message:"Doctor already present"})
      }
    //   console.log(req.file);
      

      //hashing the password
      const salt=await bcrypt.genSalt(10);
      const hashedpassword=await bcrypt.hash(password,salt);
   
      const imageupload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
   
     
    //  const imageurl="wneduwbnejkd3nedl.jpg";

       const imageurl=imageupload.secure_url;

    //    console.log(imageurl);
       
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
     
      return res.json({success:"true",message:"data added successfully"})

    } catch (error) {
        console.log(error);
      return  res.json({success:"false",message:error.message}) ;
        
    }
}
// API for login admin

const loginAdmin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(email=== process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
           const token=jwt.sign(
            email+password,process.env.JWT_SECRET);
           return res.json({success:"true",token});
        }else{
            return res.json({success:"false",message:"invalid credentials"})
        }
       
        
    } catch (error) {
        console.log(error);
        res.json({success:"login failes",message:error.message}) ;
    }
}

// Api for getting all doctor data

const alldoctors=async(req,res)=>{
    
 try {
   const doctors=await doctorModel.find({}).select('-password');
      // console.log(doctors);
     return res.json({success:'true',doctors}) ;

 } catch (error) {
    console.log(error);
   return res.json({success:"false",message:error.message}) ;
 }

} 

// Api to get All appointment list

const appointmentAdmin=async(req,res)=>{
     
     try {
        const appointments=await appointmentModel.find({});

        return res.json({success:true,appointments});

     } catch (error) {
      console.log(error);
      res.json({success:"login failes",message:error.message}) ;
     }
}

//  Api for appointment Cancellation

const appointmentCancel = async (req, res) => {

  try {
    const {appointmentId } = req.body;

    const appointmentdata = await appointmentModel.findById(appointmentId);

   
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });


    // releasing doctor slots

    const { docId, slotTime, slotDate } = appointmentdata;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    return res.json({ success: true, message: 'Appointment cancelled' });





  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
}

//Api to get Dashboard Data for admin panel

const adminDashboard=async(req,res)=>{
    
   try {
         const doctors=await doctorModel.find({});
         const users=await UserModel.find({});
         const appointments=await appointmentModel.find({});

         const dashData={
          doctors:doctors.length,
          appointments:appointments.length,
          patients:users.length,
          latestAppointments:appointments.reverse().slice(0,5)
         }

         return res.json({success:true,dashData});


    
   } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
   }


}




export {
  addDoctor,loginAdmin,alldoctors,appointmentAdmin
  ,appointmentCancel,adminDashboard
};