import express from 'express';
import { addDoctor,adminDashboard,alldoctors,appointmentAdmin,appointmentCancel,loginAdmin } from '../Controllers/adminController.js';
import { upload} from '../Middlewares/multer.js';
import authAdmin from '../Middlewares/authadmin.js';
import { changeAvailability } from '../Controllers/doctorController.js';
// import authadmin from '../Middlewares/authadmin.js';


const adminRouter=express.Router();

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor);
adminRouter.post('/login',loginAdmin);
adminRouter.post('/all-doctors',authAdmin,alldoctors);
adminRouter.post('/change-availability',authAdmin,changeAvailability);
adminRouter.get('/appointments',authAdmin,appointmentAdmin);
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel);
adminRouter.get('/dashboard',authAdmin,adminDashboard);


export default adminRouter; 