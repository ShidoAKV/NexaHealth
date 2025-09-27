import jwt from 'jsonwebtoken';
// admin authentication middleware

const authAdmin=async (req,res,next)=>{
    try {
      const {atoken}=req.headers;
        //  console.log(req.headers);
        
        
      if(!atoken){
        return  res.json({success:"false",message:"Not Authorised login again"});
      }

       const token_decode=jwt.verify(atoken,process.env.JWT_SECRET);
      
      
      if(token_decode!==(process.env.ADMIN_EMAIL+process.env.ADMIN_PASSWORD)){
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