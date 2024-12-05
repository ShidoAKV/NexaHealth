import jwt from 'jsonwebtoken';


// admin authentication middleware


const authAdmin=async (req,res,next)=>{
    try {
      const {admintoken}=req.headers;
    //    console.log(admintoken);
      
      if(!admintoken){
        return  res.json({success:"false",message:"Not Authorised login again"});
      }

      const token_decode=jwt.verify(admintoken,process.env.JWT_SECRET);
    //   console.log(token_decode);
      
      if(token_decode!==(process.env.ADMIN_EMAIL)){
        return  res.json({success:"false",message:"Not Authorised login again"});
      }
    //   console.log("successfully createdd");
      
// if token was real move the execution forward
      next();
    
    } catch (error) {
        console.log(error);
        res.json({success:"false",message:error.message}) ;
    }

}

export default authAdmin;