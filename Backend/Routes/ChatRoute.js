import express from 'express';
import { deletechat, fetchchat, sendChat, sendPdf } from '../Controllers/chatController.js';
import authUser from '../Middlewares/authUser.js';
import authDoctor from '../Middlewares/authDoctor.js';
import { upload } from '../Middlewares/multer.js';
import { uploadpdf } from '../Middlewares/pdfmulter.js';
const chatRouter=express.Router();


// User Chat
chatRouter.post('/user/send',upload.single('image'),authUser,sendChat);
chatRouter.post('/user/send-pdf',uploadpdf.single('pdf'),authUser,sendPdf);
chatRouter.post('/user/fetchchat',authUser,fetchchat);
chatRouter.post('/user/delete-chat',deletechat);


// Doctor Chat
chatRouter.post('/doctor/send',authDoctor,sendChat);
chatRouter.post('/doctor/fetchchat',authDoctor,fetchchat);
chatRouter.post('/doctor/send-pdf',uploadpdf.single('pdf'),authDoctor,sendPdf);


export default chatRouter;