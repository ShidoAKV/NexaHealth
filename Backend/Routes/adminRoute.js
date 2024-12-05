import express from 'express';
import { addDoctor,loginAdmin } from '../Controllers/adminController.js';
import { upload} from '../Middlewares/multer.js';
// import authadmin from '../Middlewares/authadmin.js';


const adminRouter=express.Router();

adminRouter.post('/add.doctor',upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin);

export default adminRouter;