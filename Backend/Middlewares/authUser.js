import jwt from 'jsonwebtoken';

// admin authentication middleware

const authUser=async (req,res,next)=>{
    try {
        // header se sirf token name se bhej rhe hai token
      const {token}=req.headers;
        //  console.log(req.headers);
        
        
      if(!token){
        return  res.json({success:false,message:"Not Authorised login again"});
      }

       const token_decode=jwt.verify(token,process.env.JWT_SECRET);
        // token_decode  se user id mil jaagi kyuki payload me id daali hai
        // console.log(token_decode.id);
        
       req.body.userId=token_decode.id;

       next();
    
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) ;
    }

}

export default authUser;