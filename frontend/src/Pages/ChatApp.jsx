import React, { useState, useEffect, useContext } from "react";
import { Appcontext } from "../Context/Context";
import axios from "axios";
import io from "socket.io-client";
// import useSound from "use-sound";
import ScrollToBottom from "react-scroll-to-bottom";
import { MdOutlineVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import loaderanimation from '/public/loader.json'
import Lottie from "lottie-react";

const ChatApp = () => {
  // const [playSound] = useSound("MessageNotification.mp3");
  const { backendurl, token, userData } = useContext(Appcontext);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
 
  const navigate = useNavigate();

  const [Image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataindex, setDataindex] = useState(null);


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
    if (token && selectedDoctor?._id && userData?._id) {
      const newSocket = io(backendurl, {
        query: { userId: userData._id },
      });

      newSocket.on("status-update", ({ userId, status }) => {
        setDoctorStatus((prev) => ({ ...prev, [userId]: status }));
      });

      newSocket.on("newMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      newSocket.emit("register-chat", {
        userId: userData._id,
        docId: selectedDoctor._id,
      });

      // setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, selectedDoctor, userData, backendurl]);

  useEffect(() => {
    if (token) {
      const fetchAppointments = async () => {
        try {
          const { data } = await axios.get(`${backendurl}/api/user/appointments`, {
            headers: { token },
          });
          if (data.success) {
            setAppointments(data.appointments.reverse());
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
      };
      fetchAppointments();
    }
  }, [backendurl, token]);

  useEffect(() => {
    if (token && selectedDoctor) {
      const fetchMessages = async () => {
        try {
          const { data } = await axios.post(
            `${backendurl}/api/chat/user/fetchchat`,
            { senderId: userData?._id, receiverId: selectedDoctor?._id },
            { headers: { token } }
          );
          if (data.success) {
            setMessages(data.data);
          } else {
            setMessages([]);
          }
        } catch (error) {
          toast.error(error);
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [backendurl, token, selectedDoctor, userData]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleSendMessage = async () => {
    if (userMessage.trim() || Image) {
      try {

        let base64Image = null;

        if (Image) {
          setLoading(true);
          const reader = new FileReader();
          reader.readAsDataURL(Image);
          reader.onloadend = async () => {
            base64Image = reader.result;

            const newMessage = {
              senderId: userData?._id,
              receiverId: selectedDoctor?._id,
              message: userMessage.trim() ? userMessage : "Noimage",
              image: base64Image,
            };

            const { data } = await axios.post(
              `${backendurl}/api/chat/user/send`,
              newMessage,
              { headers: { token, "Content-Type": "application/json" } }
            );

            if (data.success) {
              setLoading(false);
              setMessages((prev) => [...prev, data.data]);
              setImage(null);
              setUserMessage("");
            } else {
              setLoading(false);
            }
          }
        } else {
          // Send only text message if no image
          const newMessage = {
            senderId: userData?._id,
            receiverId: selectedDoctor?._id,
            message: userMessage.trim(),
            image: null
          };

          const { data } = await axios.post(
            `${backendurl}/api/chat/user/send`,
            newMessage,
            { headers: { token, "Content-Type": "application/json" } }
          );

          if (data.success) {
            setMessages((prev) => [...prev, data.data]);
            setUserMessage("");
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handledelete=async(docId)=>{
    try {
      
        const {data}=await axios.post(`${backendurl}/api/chat/user/delete-chat`,
          { senderId: userData?._id, receiverId:docId},
        );
      
        if(data.success){
          toast.success(data.message); 
          setMessages([]);
        }else{
          toast.error(data.message);
        }
    } catch (error) {
       toast.error(error.response?.data?.message||'Something went wrong.');
    }
  }


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex justify-between h-screen w-screen pr-36  top-0 z-50 bg-slate-800   ">
      {/* Left Panel: Appointments */}
      <div className="w-[450px] bg-gray-900 p-4 border-r border-gray-300 rounded-md mt-4">
        <h2 className="text-xl font-semibold mb-4 text-center text-white">
          My Appointments
        </h2>
        <div className="overflow-y-auto max-h-full  ">
          {appointments
            .filter(
              (appointment, index, self) =>
                index ===
                self.findIndex((a) => a.docData?._id === appointment.docData?._id)
            )
            .map((doc) => (
              <div
                key={doc.docData._id}
                className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-800"
                onClick={() => handleSelectDoctor(doc.docData)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={doc.docData?.image || ""}
                    alt="Doctor"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-300">{doc.docData?.name}</p>
                    <p className="text-sm text-gray-400">{doc.docData?.speciality}</p>
                  </div>

                  <button
                   onClick={()=>handledelete(doc?.docData?._id)}
                    className="px-4 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Clear Chat
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Panel: Chat Interface */}

      <div className="flex-grow bg-slate-800 p-4 h-full">
        {selectedDoctor ? (
          <div className="bg-gray-900 shadow-lg rounded-lg p-4 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-center text-white">
              Chat with {selectedDoctor.name}
            </h2>
            <ScrollToBottom className="overflow-y-auto flex-grow p-2 bg-gray-700 border border-gray-400 rounded-md mb-4">
              {Array.isArray(messages) &&
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-center mb-2 space-x-2 relative ${msg.senderId === userData._id ? "justify-end" : "justify-start"
                      }`}
                  >
                    {
                      msg.senderId !== userData._id &&
                      <img
                        className="w-8 h-8 rounded-full object-cover "
                        src={selectedDoctor.image}
                        alt="Doctor"
                      />
                    }
                    {
                      msg.senderId == userData._id &&
                      <img
                        className="w-8 h-8 rounded-full object-cover "
                        src={userData.image}
                        alt="Doctor"
                      />
                    }
                    {
                      (msg.message) && (msg.message !== 'Noimage')
                      &&
                      <div className={`p-3 rounded-lg max-w-xs ${msg.senderId === userData._id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-300 text-gray-900"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <small className="text-xs text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </small>
                      </div>}

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

                  </div>

                ))}

              {loading &&
                <Lottie
                  className="w-48 h-40 justify-self-end"
                  animationData={loaderanimation}
                  loop={true} />
              }
            </ScrollToBottom>

            <div className="flex items-center border-t pt-2 bg-gray-900 p-2 rounded-md">

              <MdOutlineVideoCall
                onClick={() => navigate("/videocall")}
                className="h-9 w-10 mx-1 text-gray-300 hover:bg-gray-700 p-1 rounded-sm cursor-pointer"
              />

              <div className="flex justify-between w-full bg-gray-800 rounded-md px-2 py-1">

                <label htmlFor="file-upload">
                  <FiPlusCircle className="h-9 w-8 text-gray-300 hover:bg-gray-700 p-1 rounded-md cursor-pointer" />
                </label>
                <input
                  type="file"
                  id="file-upload"
                  hidden
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <img
                  className={`w-8 h-10 overflow-hidden rounded ${Image ? 'opacity-75' : 'opacity-0'}`}
                  src={Image ? URL.createObjectURL(Image) : assets.upload_icon}
                  alt="Profile Preview"
                />
                <input
                  type="text"
                  className="flex-grow p-2 bg-transparent text-white border-none focus:outline-none"
                  placeholder="Type a message"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
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
            <p>Select a doctor to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
