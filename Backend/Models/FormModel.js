import mongoose from "mongoose";

const FormSchema=new mongoose.Schema({
    patientName:{
        type:String,
        require:true
    },
    doctorName:{
        type:String,
        require:true
    },
    diagnosis:{
        type:String,
        require:true
    },
    medicines:{
        type:String,
        require:true
    },
    instructions:{
        type:String,
    },
    date:{
        type:Date,
        require:true
    },
    email:{
        type:String,
        require:true,
    }
})


export const FormModel=mongoose.model("FormModel",FormSchema);

