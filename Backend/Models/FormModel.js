import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    diagnosis: {
       type: String,
       require:true,
    },
    medicines:{
        type: String,
        require:true,
    },
    instructions:{
        type: String,
        require:true,
    },
    date:{
        type:Date,
        require:true
    },
    pdfPath:{
        type:String,
        require:true
    }, 
    notes:{
       type:String,
    }
});

const FormSchema=new mongoose.Schema({
    patientName:{
        type:String,
        require:true
    },
    doctorName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
    },
    messages: [MessageSchema],
})


export const FormModel=mongoose.model("FormModel",FormSchema);

