import React, { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../Context/DoctorContext";
import axios from "axios";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import { useNavigate } from "react-router-dom";
import { MdOutlineVideoCall } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import loaderanimation from "/public/loader.json";
import Lottie from "lottie-react";
import { toast } from 'react-toastify'
import { FaFilePdf, FaTimes } from "react-icons/fa";

const DoctorChat = () => {
  
  const {
    backendurl,
    dToken,
    ProfileData,
    getAppointments,
    appointments,
  } = useContext(DoctorContext);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [docmessage, docSetMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const [Image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataindex, setDataindex] = useState(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  

  useEffect(() => {
    let imagePreviewUrl;
    if (Image) {
      imagePreviewUrl = URL.createObjectURL(Image);
    }
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [Image]);


  useEffect(() => {
    if (dToken && ProfileData?._id) {
      // Connect with only the doctor's id in the handshake.
      const newSocket = io(backendurl, {
        query: { docId: ProfileData._id },
      });

      newSocket.on("status-update", ({ userId, status }) => {
        console.log({ userId, status });
        setUserstatus((prev) => ({ ...prev, [userId]: status }));
      });

      newSocket.on("newMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [backendurl, dToken, ProfileData]);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);


  useEffect(() => {
    if (selectedUser) {
      // When a patient is selected, register the chat pairing.
      if (socket) {
        socket.emit("register-chat", {
          docId: ProfileData._id,
          userId: selectedUser._id,
        });
      }
      const fetchMessages = async () => {
        try {
          const response = await axios.post(
            `${backendurl}/api/chat/doctor/fetchchat`,
            { senderId: ProfileData?._id, receiverId: selectedUser?._id },
            { headers: { dToken } }
          );
          if (response.data.success) {
            setMessages(response.data.data);
          } else {
            setMessages([]);
          }
        } catch (error) {
          toast.error(error);
        }
      };
      fetchMessages();
    }
  }, [selectedUser, backendurl, dToken, ProfileData, socket]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (pdfFile && pdfFile.type === "application/pdf") {
      await handlesendpdf();

    }else{
      if (docmessage.trim() || Image) {
      try {
        let base64Image = null;
        if (Image) {
          setLoading(true);
          const reader = new FileReader();
          reader.readAsDataURL(Image);
          reader.onloadend = async () => {
            base64Image = reader.result;

            const tempMessage = {
              _id: Date.now().toString(),
              senderId: ProfileData._id,
              receiverId: selectedUser._id,
              message: docmessage.trim() ? docmessage : "Noimage",
              timestamp: new Date().toISOString(),
              image: base64Image,
            };

            const { data } = await axios.post(
              `${backendurl}/api/chat/doctor/send`,
              tempMessage,
              { headers: { dToken, "Content-Type": "application/json" } }
            )

            if (data.success) {
              setLoading(false);
              setMessages((prev) => [...prev, tempMessage]);
              docSetMessage("");
              setImage(null);
            } else {
              setLoading(false);
            }
          }
        } else {

          const tempMessage = {
            _id: Date.now().toString(),
            senderId: ProfileData._id,
            receiverId: selectedUser._id,
            message: docmessage.trim() ? docmessage : "Noimage",
            timestamp: new Date().toISOString(),
            image: null,
          };
          const { data } = await axios.post(
            `${backendurl}/api/chat/doctor/send`,
            tempMessage,
            { headers: { dToken, "Content-Type": "application/json" } }
          );

          if (data.success) {
            setLoading(false);
            setMessages((prev) => [...prev, tempMessage]);
            docSetMessage("");
          } else {
            toast.error(data.message);
          }

        }
      } catch (error) {
        toast.error(error.response.data.message)
      }
    }
  }
  }

  const handledelete = async (userId) => {
    try {

      const { data } = await axios.post(`${backendurl}/api/chat/user/delete-chat`,
        { senderId: ProfileData?._id, receiverId: userId },
      );

      if (data.success) {
        toast.success(data.message);
        setMessages([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    }
  }

 

  const handlesendpdf = async () => {
    if (!pdfFile || pdfFile.type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("senderId", ProfileData?._id);
      formData.append("receiverId", selectedUser?._id);
      
      const {data} = await axios.post(
        `${backendurl}/api/chat/doctor/send-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
             dToken
          },
        }
      );

      if (data.success) {
         setMessages((prev) => [...prev, data.data]); 
         setPdfFile(null);
      } else {
        toast.error("Failed to send PDF.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending PDF.");
    } finally {
      setLoading(false);
  }
  };

  const removeAttachment = () => setPdfFile(null);
  const removeimageAttachment = () => setImage(null);


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };




  return (
    <div className="flex h-screen w-screen top-0 z-50 bg-slate-800 ">
      <div className="w-1/3  p-4 border-r border-gray-300 bg-gray-900">
        <div className="text-xl font-semibold mb-4 text-center text-white">
          My Patients
        </div>
        <div className="overflow-y-auto max-h-full  border-gray-300">
          {appointments
            .filter(
              (appointment, index, self) =>
                index ===
                self.findIndex(
                  (a) => a.userData?._id === appointment.userData?._id
                )
            )
            .map((user) => (
              <div
                key={user.userData._id}
                className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSelectUser(user.userData)}
              >
                <div className="flex items-center space-x-3 ">
                  <img
                    src={user.userData.image || ""}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-300">{user.userData.name}</p>
                    <p className="text-sm text-gray-400">{user.userData.email}</p>
                  </div>
                  <button
                    onClick={() => handledelete(user?.userData?._id)}
                    className="px-4 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex-grow bg-slate-800 p-4">
        {selectedUser ? (
          <div className="bg-gray-900 shadow-lg rounded-lg p-4 h-full flex flex-col">
            <div className="text-xl font-semibold mb-4 text-center text-white">
              Chat with {selectedUser.name}
            </div>
            <ScrollToBottom className="overflow-y-auto flex-grow p-2 bg-gray-700 border border-gray-400 rounded-md mb-4">
              {Array.isArray(messages) &&
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-center mb-2 space-x-2 relative ${msg.senderId === ProfileData._id ? "justify-end" : "justify-start"
                      }`}
                  >
                    {
                      msg.senderId !== ProfileData._id &&
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={selectedUser.image}
                        alt="Doctor"
                      />
                    }
                    {
                      msg.senderId == ProfileData._id &&
                      <img
                        className="w-8 h-8 rounded-full object-cover"
                        src={ProfileData.image}
                        alt="Doctor"
                      />
                    }
                    {
                      (msg.message.trim() !== "nexahealthpdf" && msg.message.trim() !== "Noimage") && <div
                        className={`p-3 rounded-lg max-w-xs ${msg.senderId === ProfileData._id
                          ? "bg-gray-900 text-white"
                          : "bg-gray-300 text-gray-900"
                          }`}
                      >

                        <p>{msg.message}</p>
                        <small className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </small>
                      </div>
                    }

                    {msg.image && (
                      <div
                        className="relative flex flex-row-reverse"
                        onMouseEnter={() => setDataindex(index)}
                        onMouseLeave={() => setDataindex(null)}
                      >
                        <img
                          src={msg.image}
                          alt="Sent image"
                          className="w-40 h-auto rounded-lg mt-2"
                        />
                        {dataindex === index && (
                          <button
                            className="absolute bottom-2 right-2 bg-black text-white h-8 w-20 cursor-pointer text-center rounded-md"
                            onClick={() => window.open(msg.image)}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    )}

                    {msg.pdf && (
                      <div
                        className="relative flex flex-row-reverse"
                        onMouseEnter={() => setDataindex(index)}
                        onMouseLeave={() => setDataindex(null)}
                      >
                        <iframe
                          src={msg.pdf}
                          title="PDF Preview"
                          className="w-40 h-48 rounded-lg mt-2"
                        ></iframe>


                        {dataindex === index && (
                          <button
                            className="absolute bottom-2 right-2 overflow-hidden bg-black text-white h-8 w-20 cursor-pointer text-center rounded-md"
                            onClick={() => window.open(msg.pdf)}
                          >
                            Download
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                ))}

              {loading &&
                <Lottie
                  className="w-48 h-40 justify-self-end"
                  animationData={loaderanimation}
                  loop={true} />
              }
            </ScrollToBottom>

            <div className="flex items-center border-t pt-2">
              <MdOutlineVideoCall
                onClick={() => navigate("/doctor-videocall")}
                className="h-9 w-8 text-gray-300 hover:bg-gray-700 mr-1 rounded-sm cursor-pointer"
              />
              

              <div className="flex justify-between items-center w-full bg-gray-800 rounded-md px-2 py-1">
                <label htmlFor="file-upload">
                  <FiPlusCircle className="h-9 w-8 text-gray-300 hover:bg-gray-700 p-1 rounded-md cursor-pointer"
                    onClick={() => setShowOptions((prev) => !prev)}
                  />
                </label>
                {showOptions && (
                  <div className="absolute z-50 bg-neutral-800 border rounded-lg shadow-xl p-4 w-56 top-[80%]  text-sm">
                    <div className="flex flex-col gap-4">

                     {/* Upload Image Section */}
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white border border-blue-200 transition"
                      >
                        <span>📷 Upload Image</span>
                        <input
                          type="file"
                          id="image-upload"
                          hidden
                          accept="image/*"
                          onChange={(e) => {setImage(e.target.files[0]),setShowOptions(false)}}
                        />
                      </label>

                      {/* Upload PDF Section */}
                      <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white border border-red-200 transition"
                      >
                        <span>📄 Upload PDF</span>
                        <input
                          type="file"
                          id="pdf-upload"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) =>{ setPdfFile(e.target.files[0]),setShowOptions(false)}}
                        />
                      </label>
                    
                    </div>
                  </div>

                )}

                {pdfFile && (
                  <div className=" flex items-center gap-2 bg-gray-800 text-white p-2 rounded-md mr-2">
                    {pdfFile.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(pdfFile)}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <FaFilePdf className="w-6 h-6 text-red-500" />
                    )}
                    <span className="text-sm truncate max-w-[150px]">{pdfFile.name}</span>
                    <button onClick={removeAttachment}>
                      <FaTimes className="text-white hover:text-red-400" />
                    </button>
                  </div>
                )}

                {/* Preview (only shown when an image is selected) */}
               { (Image )&&<div className=" flex items-center gap-2 bg-gray-800 text-white p-2 rounded-md mr-2">
                {Image.type.startsWith("image/") && (
                  <img
                    className="w-8 h-10 overflow-hidden rounded opacity-75"
                    src={URL.createObjectURL(Image)}
                    alt="Preview"
                  />
          
                )}
                 <button onClick={removeimageAttachment}>
                    <FaTimes className="text-white hover:text-red-400" />
                  </button>
                </div>}
                <input
                  type="text"
                  className="flex-grow  p-2 bg-transparent text-white border-none focus:outline-none"
                  placeholder="Type a message"
                  value={docmessage}
                  onChange={(e) => docSetMessage(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e)}
                />
             

               
              </div>


              <button
                onClick={handleSendMessage}
                className="bg-green-500 text-white p-2 ml-2 rounded-md hover:bg-green-600 transition"
              >
                <IoSend className="w-6 h-6" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-300">
            <p>Select a patient to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(DoctorChat);
