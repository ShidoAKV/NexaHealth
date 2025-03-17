import { doctorModel } from "../Models/Doctormodel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { appointmentModel } from "../Models/AppointmentModel.js";
import { FormModel } from "../Models/FormModel.js";
import nodemailer from 'nodemailer';
import validator from 'validator';
import pdf from 'html-pdf';

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        // Validate docId
        if (!docId) {
            return res.json({ success: "false", message: "Doctor ID is required" });
        }

        // Fetch doctor data
        const docData = await doctorModel.findById(docId);

        if (!docData) {
            return res.json({ success: "false", message: "Doctor not found" });
        }

        // Update availability
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        return res.json({ success: "true", message: "Availability changed" });

    } catch (error) {
        // console.log(error);
        return res.json({ success: "false", message: error.message });
    }
};

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email']);
        return res.json({ success: true, doctors });

    } catch (error) {

        return res.json({ success: "false", message: error.message });
    }
}

// Api for doctor login

const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email });

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid Credentials' });
        }

        const isMatched = await bcrypt.compare(password, doctor.password);

        if (isMatched) {

            // creating token
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
            return res.json({ success: true, token });
        } else {
            return res.json({ success: false, message: 'Invalid Credentials' });
        }






    } catch (error) {
        return res.json({ success: "false", message: error.message });
    }
}


// Api to get all doctors

const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId });

        return res.json({ success: true, appointments });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
}

// Api to mark Appointment completed for doctor Panel

const appointmentComplete = async (req, res) => {

    try {
        const { docId, appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            return res.json({ success: true, message: 'Appointment completed' });

        }


        return res.json({ success: false, message: 'Mark Failed' });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });

    }
}

const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;

        // Validate input
        if (!docId || !appointmentId) {
            return res.status(400).json({ success: false, message: 'docId and appointmentId are required' });
        }

        // Fetch appointment data
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Verify doctor ID matches
        if (appointmentData.docId.toString() !== docId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Doctor ID mismatch' });
        }

        // Fetch doctor data
        const DocData = await doctorModel.findById(docId);
        if (!DocData) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Update doctor and appointment models
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        return res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



// Api to get dashboard data for doctor panel

const doctorDashboard = async (req, res) => {

    try {

        const { docId } = req.body;

        const appointments = await appointmentModel.find({ docId });

        let earnings = 0;

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = [];

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        return res.json({ success: true, dashData });



    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });

    }
}

//Api to get Doctor Profile

const doctorProfile = async (req, res) => {

    try {
        const { docId } = req.body;

        const ProfileData = await doctorModel.findById(docId).select('-password');

        return res.json({ success: true, ProfileData });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });

    }
}


const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, available } = req.body;

        await doctorModel.findByIdAndUpdate(docId, {
            fees, address, available
        })

        return res.json({ success: true, message: 'Profile Updated' });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });

    }
}



// medical-form data logic

const generateForm = async (req, res) => {
    try {
        const formdata = new FormModel(req.body);

        if (!validator.isEmail(formdata.email)) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }

        const form = await formdata.save();
        if (!form) {
            return res.status(500).json({ success: false, message: "Form error" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Generate HTML content for the PDF
        const emailHtml = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                h1 { text-align: center; color: #333; }
                p { font-size: 14px; line-height: 1.6; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                #instruction{
                 text-color:'red'
                }

            </style>
        </head>
        <body>
            <h1>Medical Prescription</h1>
            <p><strong>Patient Name:</strong> ${req.body.patientName}</p>
            <p><strong>Doctor Name:</strong> Dr. ${req.body.doctorName}</p>
            <p><strong>Diagnosis:</strong> ${req.body.diagnosis}</p>
            
            <h2>Medicines</h2>
            <p>${req.body.medicines.replace(/\n/g, "<br>")}</p> <!-- Convert newlines to HTML line breaks -->
            
            <h2 id="instruction">Instructions</h2>
            <p>${req.body.instructions || "No special instructions"}</p>
    
            <p ><strong>Date:</strong> ${new Date(req.body.date).toDateString()}</p>
            <br>
            <p style="text-align: center;">Regards,</p>
            <p style="text-align: center;"><strong>NexaHealth Team</strong></p>
        </body>
        </html>
    `;

        const pdfPath = "prescription-content.pdf";



        pdf.create(emailHtml, { format: "A4" }).toFile(pdfPath, async (err) => {
            if (err){
                return res.json({ success: false, message: "Error generating PDF" });
            }
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: req.body.email,
                subject: "Your Medical Prescription",
                text: "Please find your attached medical prescription PDF.",
                attachments: [
                    {
                        filename: "prescription-content.pdf",
                        path: pdfPath,
                    },
                ],
            };
    
            
            transporter.sendMail(mailOptions, (error, info) => {
                fs.unlinkSync(pdfPath); 
                
                if (error) {
                    return res.status(500).json({ success: false, message: "Email sending failed" });
                }

                return res.json({ success: true, message: "Email sent successfully!", info });
            });
        });

         return  res.json({ success: true, message: "Email sent successfully!" });


       
       
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};






export {
    changeAvailability, doctorList, loginDoctor,
    appointmentsDoctor, appointmentComplete,
    appointmentCancel, doctorDashboard, doctorProfile
    , updateDoctorProfile, generateForm
};