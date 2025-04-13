import express from "express";
import { AssistanceResponse, bookAppointment, cancelAppointment, getProfile, listAppointment, loginUser, paymentRazorpay, registerUser, updateProfile, verifyRazorpay } from "../Controllers/UserController.js";
import authUser from "../Middlewares/authUser.js";
import { upload } from "../Middlewares/multer.js";

const useRouter=express.Router();

useRouter.post('/register',registerUser);
useRouter.post('/login',loginUser);
useRouter.get('/get-profile',authUser,getProfile);
useRouter.post('/update-profile',upload.single('image'),authUser,updateProfile);

useRouter.post('/book-appointment',authUser,bookAppointment);
useRouter.get('/appointments',authUser,listAppointment);
useRouter.post('/cancel-appointment',authUser,cancelAppointment);

useRouter.post('/payment-razorpay',authUser,paymentRazorpay);


useRouter.post('/verifyRazorpay',authUser,verifyRazorpay);


useRouter.post('/assistance-response',authUser,AssistanceResponse)


export default useRouter;

