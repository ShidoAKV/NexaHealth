// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();
const uploadpdf = multer({ storage });

export {uploadpdf};
 
