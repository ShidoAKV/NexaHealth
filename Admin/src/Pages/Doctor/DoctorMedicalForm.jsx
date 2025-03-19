import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Downloadicon from "../../assets/Downloadicon.png";
import loaderanimation from "/public/loader.json";
import Lottie from "lottie-react";

const schema = yup.object().shape({
  patientName: yup.string().required("Patient name is required"),
  doctorName: yup.string().required("Doctor name is required"),
  diagnosis: yup.string().required("Diagnosis is required"),
  medicines: yup.string().required("Medicine details are required"),
  instructions: yup.string(),
  date: yup.date().required("Date is required"),
  email: yup.string().email("Invalid email").required("Patient email is required"),
});

const DoctorMedicalForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });


  const pdfRef = useRef();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:7000/api/doctor/generate-form",
        data
      );
    
      if (response.data.success) {
        toast.success("Prescription sent successfully");
      }
    } catch (error) {
        toast.error(error.response.data.message);
    }
  };
  const [loading, setLoading] = useState(false);

  const handleDownload = () => {

    setTimeout(() => {
      html2canvas(pdfRef.current, {
        scale: 2,
        ignoreElements: (element) => element.classList.contains("loader"),

      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          format: "a4"
        });
        // console.log(pdf);

        const imageProperties = pdf.getImageProperties(imgData);
        const pdfwidth = pdf.internal.pageSize.getWidth();
        const pdfheight = (imageProperties.height * pdfwidth) / (imageProperties.width);

        pdf.addImage(imgData, "PNG", 10, 10, pdfheight, pdfwidth);
        pdf.save(`prescription.pdf`);
      });
      setLoading(false);

    }, 3000);

  }



  return (
    <div className="flex flex-col md:flex-row md:justify-between h-auto md:h-screen w-full gap-4 bg-black p-4">
      {/* FORM SECTION */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full md:w-1/2 mx-auto px-5 py-5 border rounded-lg bg-blue-900 bg-opacity-60 overflow-scroll no-scrollbar"
      >
        <h1 className="text-center text-2xl text-slate-300 mb-4">
          Prescription Form
        </h1>

        <div>
          <label className="text-slate-300">Patient Name:</label>
          <input {...register("patientName")} className="border p-3 w-full rounded-md" />
          <p className="text-red-500">{errors.patientName?.message}</p>
        </div>

        <div>
          <label className="text-slate-300">Doctor Name:</label>
          <input {...register("doctorName")} className="border p-2 w-full rounded-md" />
          <p className="text-red-500">{errors.doctorName?.message}</p>
        </div>

        <div>
          <label className="text-slate-300">Diagnosis:</label>
          <textarea {...register("diagnosis")} className="border p-2 w-full rounded-md" />
          <p className="text-red-500">{errors.diagnosis?.message}</p>
        </div>

        <div>
          <label className="text-slate-300">Medicines & Dosage:</label>
          <textarea {...register("medicines")} className="border p-2 w-full rounded-md no-scrollbar" />
          <p className="text-red-500">{errors.medicines?.message}</p>
        </div>

        <div>
          <label className="text-slate-300">Special Instructions:</label>
          <textarea {...register("instructions")} className="border p-2 w-full rounded-md" />
        </div>

        <div>
          <label className="text-slate-300">Prescription Date:</label>
          <input type="date" {...register("date")} className="border p-2 w-full rounded-md" />
          <p className="text-red-500">{errors.date?.message}</p>
        </div>

        <div>
          <label className="text-slate-300">Patient Email:</label>
          <input type="email" {...register("email")} className="border p-2 w-full rounded-md" />
          <p className="text-red-500">{errors.email?.message}</p>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 mt-4 rounded hover:bg-blue-600 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending" : "Send"}
        </button>
      </form>

      {/* PRESCRIPTION PREVIEW */}
      <div className="bg-blue-950 w-full md:w-1/2 p-4 rounded-lg border-[1.5px] border-white">
        <div
          ref={pdfRef}
          className="max-h-[550px] w-full  md:w-auto bg-white rounded-md mx-auto my-4 p-4 overflow-y-auto no-scrollbar flex flex-col gap-4"
        >
          <div className="flex justify-end loader">
            <img
              className="cursor-pointer h-10 w-10 downloadicon"
              src={Downloadicon}
              alt="Download PDF"
              onClick={() => {
                setLoading(true);
                handleDownload();
              }}
            />
            {loading && (
              <Lottie className="w-72 h-72 z-50 mx-auto" animationData={loaderanimation} loop={true} />
            )}
          </div>

          <div className={`flex flex-col gap-4 ${loading ? "blur-2xl" : ""} break-words max-w-full`}>
            <strong className="text-center text-xl">Medical Prescription</strong>

            <p>
              <strong>Patient Name:</strong> {watch("patientName") || "__________"}
            </p>
            <p>
              <strong>Doctor Name:</strong> Dr. {watch("doctorName") || "__________"}
            </p>
            <p>
              <strong>Diagnosis:</strong> {watch("diagnosis") || "__________"}
            </p>
            <h1 className="font-bold">Medicines: {watch("medicines") || "__________"}</h1>
            <h1 className="font-bold text-red-600">Instructions:</h1>
            <p className="break-words max-w-full">
              {`"`}{watch("instructions") || "_______________"}{`"`}
            </p>
            <p>
              <strong>Date:</strong> {watch("date") ? new Date(watch("date")).toDateString() : "__________"}
            </p>

            <div className="text-center">
              <p>Regards</p>
              <strong className="text-xl">NexaHealth Team</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            handleDownload();
          }}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-800  w-full md:w-40    "
        >
          Download
        </button>
      </div>
    </div>


  );
};

export default DoctorMedicalForm;
