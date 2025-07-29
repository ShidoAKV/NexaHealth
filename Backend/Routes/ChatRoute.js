import express from 'express';
import { deletechat, fetchchat, sendChat } from '../Controllers/chatController.js';
import authUser from '../Middlewares/authUser.js';
import authDoctor from '../Middlewares/authDoctor.js';
import { upload } from '../Middlewares/multer.js';
const chatRouter=express.Router();


// User Chat
chatRouter.post('/user/send',upload.single('image'),authUser,sendChat);
chatRouter.post('/user/fetchchat',authUser,fetchchat);
chatRouter.post('/user/delete-chat',deletechat);


// Doctor Chat
chatRouter.post('/doctor/send',authDoctor,sendChat);
chatRouter.post('/doctor/fetchchat',authDoctor,fetchchat);


export default chatRouter;