import { doctorModel } from "../Models/Doctormodel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { appointmentModel } from "../Models/AppointmentModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        // Validate docId
        if (!docId) {
            return res.json({ success: "false", message: "Doctor ID is required" });
        }

        // Fetch doctor data
        const docData = await doctorModel.findById(docId);

        if (!docData) {
            return res.json({ success: "false", message: "Doctor not found" });
        }

        // Update availability
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        return res.json({ success: "true", message: "Availability changed" });

    } catch (error) {
        // console.log(error);
        return res.json({ success: "false", message: error.message });
    }
};

const doctorList=async(req,res)=>{
    try {
         const doctors=await doctorModel.find({}).select(['-password','-email']);
         return res.json({success:true,doctors});

    } catch (error) {

        return res.json({ success: "false", message: error.message });
    }
}

// Api for doctor login

const loginDoctor=async(req,res)=>{
     try {
         const {email,password}=req.body;
         const doctor=await doctorModel.findOne({email});

         if(!doctor){
            return res.json({success:false,message:'Invalid Credentials'});
         }

         const isMatched=await bcrypt.compare(password,doctor.password);

         if(isMatched){

         // creating token
         const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET);
         return res.json({success:true,token});
         }else{
            return res.json({success:false,message:'Invalid Credentials'});
         }
  


      

        
     } catch (error) {
         return res.json({ success: "false", message: error.message });
     }
}


// Api to get all doctors

const appointmentsDoctor=async(req,res)=>{
    try {
        const {docId}=req.body;
        const appointments=await appointmentModel.find({docId});
         
        return res.json({success:true,appointments});
   
    } catch (error) {
        console.log(error);
        return res.json({ success:false, message: error.message });
    }
}

// Api to mark Appointment completed for doctor Panel

const appointmentComplete=async(req,res)=>{

    try {
          const {docId,appointmentId}=req.body;

          const appointmentData=await appointmentModel.findById(appointmentId);
        
           if(appointmentData&& appointmentData.docId===docId){
              await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true});
              return res.json({ success:true, message:'Appointment completed' });
    
           }


        return res.json({success:false,message:'Mark Failed'});
    } catch (error) {
        console.log(error);
        return res.json({ success:false, message: error.message });
    
    }
}

const appointmentCancel = async (req, res) => {
    try {
      const { docId, appointmentId } = req.body;
  
      // Validate input
      if (!docId || !appointmentId) {
        return res.status(400).json({ success: false, message: 'docId and appointmentId are required' });
      }
  
      // Fetch appointment data
      const appointmentData = await appointmentModel.findById(appointmentId);
      if (!appointmentData) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
  
      // Verify doctor ID matches
      if (appointmentData.docId.toString() !== docId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized: Doctor ID mismatch' });
      }
  
      // Fetch doctor data
      const DocData = await doctorModel.findById(docId);
      if (!DocData) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
  
      // Update doctor and appointment models
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true});
  
      return res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  


// Api to get dashboard data for doctor panel

const doctorDashboard=async(req,res)=>{
     
    try {
         
        const {docId}=req.body;

        const appointments=await appointmentModel.find({docId});

        let earnings=0;

        appointments.map((item)=>{
              if(item.isCompleted||item.payment){
                    earnings+=item.amount
              }
         })

         let patients=[];

         appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
         })

         const dashData={
            earnings,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
         }

         return res.json({success:true,dashData});



    } catch (error) {
        console.log(error);
        return res.json({ success:false, message: error.message });
    
    }
}

//Api to get Doctor Profile

const doctorProfile=async(req,res)=>{

    try {
        const {docId}=req.body;

        const ProfileData=await doctorModel.findById(docId).select('-password');

        return res.json({ success:true,ProfileData});
 
    } catch (error) {
        console.log(error);
        return res.json({ success:false, message: error.message });
    
    }
}


const updateDoctorProfile=async(req,res)=>{
    try {
        const {docId,fees,address,available}=req.body;

       await doctorModel.findByIdAndUpdate(docId,{
        fees,address,available
       })

        return res.json({ success:true,message:'Profile Updated'});
 
    } catch (error) {
        console.log(error);
        return res.json({ success:false, message: error.message });
    
    }
}

export { 
    changeAvailability ,doctorList,loginDoctor,
    appointmentsDoctor,appointmentComplete,
    appointmentCancel,doctorDashboard,doctorProfile
    ,updateDoctorProfile
};
