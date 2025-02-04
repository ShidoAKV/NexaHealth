import jwt from 'jsonwebtoken';

// doctor authentication middleware

const authDoctor=async (req,res,next)=>{
    try {
        // header se sirf token name se bhej rhe hai token
      const {dtoken}=req.headers;
        //  console.log(req.headers);
        
        
      if(!dtoken){
        return  res.json({success:false,message:"Not Authorised login again"});
      }

       const token_decode=jwt.verify(dtoken,process.env.JWT_SECRET);
        // token_decode  se user id mil jaagi kyuki payload me id daali hai
        // console.log(token_decode.id);
       req.body.docId=token_decode.id;
       next();
    
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message}) ;
    }

}

export default authDoctor;