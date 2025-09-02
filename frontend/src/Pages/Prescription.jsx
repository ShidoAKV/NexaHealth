import { useContext, useEffect,useState } from "react";
import { Appcontext } from "../Context/Context";
import axios from "axios";
import { toast } from "react-toastify";

const Prescription = () => {
  const { token,backendurl,userData} = useContext(Appcontext)
  const [messagedata, setMessagedata] = useState([])

  const getmessagehistory = async () => {
      try {
        const { data } = await axios.get(backendurl + `/api/user/message-history?email=${userData.email}&patientName=${userData.name}`,
          { headers: { token } },
        );
        if (data.success) {
          setMessagedata(data.message);
        }
      } catch (error) {
        toast.error(error.response.message.data);
      }
  
  }
  
  useEffect(() => {
    if (token&&userData) {
      getmessagehistory();
    }
  }, [token,userData]);

  return (
    <div className="w-full max-w-6xl mx-auto my-5 p-4">
      <p className="mb-3 text-lg font-medium " >All Prescription History</p>
      <div className="bg-white border  rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="bg-blue-500 hidden sm:grid grid-cols-5 gap-2 p-4 border-b">
          <p className="text-white font-medium">Doctor</p>
          <p className="text-white font-medium">Date & Time</p>
          <p className="text-white font-medium">Email</p>
          <p className="text-white font-medium ml-9">Diagnosis</p>
          <p className="text-center text-white font-medium mr-20">Prescription</p>
          {/* <p className="text-center text-white font-medium">Notes</p> */}
        </div>
        {messagedata?.map((patient) =>
          patient?.messages.map((message) => (
            <div
              key={message._id}
              className="flex flex-col sm:grid  sm:grid-cols-5 gap-2 items-center p-4 border-b"
            >
              <p className="text-gray-800">{patient.doctorName}</p>
              <p className="text-gray-600">
                {new Date(message.date).toLocaleString()}
              </p>
              <p className="text-gray-600 rounded-sm no-scrollbar overflow-scroll h-6 border-neutral-600 border-[1.5px]">
                {patient.email}
              </p>
              <p className="text-gray-600 ml-9">{message.diagnosis}</p>
              <p className="text-center mr-20">
                <a
                  href={message.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline font-semibold"
                >
                  prescription
                </a>
              </p>

              {/* <div className=" w-full flex justify-end gap-3">
                <p className="text-gray-600 border-[1.5px]  border-black rounded-md overflow-x-scroll no-scrollbar h-8 w-full">
                  {message.notes || "No notes added."}
                </p>
                <button
                  className="bg-orange-600 text-white px-3 py-1 rounded "
                  onClick={() => openModal(message._id, patient._id, message.notes)}
                >
                  {message.notes ? "Edit" : "+"}
                </button>
                <button
                  className="bg-blue-600 px-3 py-1 rounded-md text-white"
                  onClick={() => openFullView(message.notes)}
                >
                  View
                </button>
              </div> */}
            </div>
          ))
        )}
      </div>

    </div>
  )
}


export default Prescription