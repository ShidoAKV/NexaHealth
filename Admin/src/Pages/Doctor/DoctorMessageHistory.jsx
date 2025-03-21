import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../Context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorMessageHistory = () => {
  const { dToken, backendurl, messagedata, getmessagehistory } = useContext(DoctorContext);
  const [currentNote, setCurrentNote] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullview, setFullview] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  useEffect(() => {
    if (dToken) {
      getmessagehistory();
    }
  }, [dToken]);

  const handleNoteChange = (e) => {
    setCurrentNote(e.target.value);
  };

  const handleNoteSave = async () => {
    try {
      const { data } = await axios.post(
        `${backendurl}/api/doctor/edit`,
        {
          messageid: editingMessageId,
          formid: editingPatientId,
          data: currentNote,
        },
        {
          headers: { dToken },
        }
      );

      if (data.success) {
        toast.success(data.message);
        closeModal(); 
        getmessagehistory(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const openModal = (messageId, patientId, existingNote) => {
    setEditingMessageId(messageId);
    setEditingPatientId(patientId);
    setCurrentNote(existingNote || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMessageId(null);
    setEditingPatientId(null);
    setCurrentNote("");
  };

  const openFullView = (note) => {
    setSelectedNote(note || "No notes available.");
    setFullview(true);
  };

  const closeFullView = () => {
    setFullview(false);
    setSelectedNote("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-5 p-4">
      <p className="mb-3 text-lg font-medium">All Message History</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="bg-blue-500 hidden sm:grid grid-cols-6 gap-2 p-4 border-b">
          <p className="text-white font-medium">Patient</p>
          <p className="text-white font-medium">Date & Time</p>
          <p className="text-white font-medium">Email</p>
          <p className="text-white font-medium ml-9">Diagnosis</p>
          <p className="text-center text-white font-medium mr-20">Prescription</p>
          <p className="text-center text-white font-medium">Notes</p>
        </div>
        {messagedata?.map((patient) =>
          patient.messages.map((message) => (
            <div
              key={message._id}
              className="flex flex-col sm:grid sm:grid-cols-6 gap-2 items-center p-4 border-b"
            >
              <p className="text-gray-800">{patient.patientName}</p>
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
                  className="text-blue-500 underline"
                >
                  prescription
                </a>
              </p>

              <div className=" w-full flex justify-end gap-3">
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
              </div>
            </div>
          ))
        )}
      </div>

      
      {fullview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-medium mb-2">Full Note View</h2>
            <textarea
              className="w-full p-2 border rounded"
              readOnly
              value={selectedNote}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeFullView}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-medium mb-2">+</h2>
            <textarea
              value={currentNote}
              onChange={handleNoteChange}
              className="w-full p-2 border rounded"
              placeholder="Add a note..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleNoteSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorMessageHistory;
