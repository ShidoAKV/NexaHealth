import React, { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../Context/DoctorContext";
import axios from "axios";
import io from "socket.io-client";
// import useSound from "use-sound";
import ScrollToBottom from "react-scroll-to-bottom";
import { useNavigate } from "react-router-dom";
import { MdOutlineVideoCall } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { assets } from "../../assets/assets";
import loaderanimation from "/public/loader.json";
import Lottie from "lottie-react";
import {toast} from 'react-toastify'


const DoctorChat = () => {
  // const [playSound] = useSound("Notification.mp3");
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
  const [userstatus, setUserstatus] = useState({});
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
  }, [backendurl, dToken]);


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
            message:docmessage.trim() ? docmessage : "Noimage",
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
          message:docmessage.trim() ? docmessage : "Noimage",
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
                  <span className="text-gray-400">click for<strong className="text-gray-400">online</strong> status</span>
                  <div>
                    {userstatus[user.userData._id] === "online" ? (
                      <span className="text-green-600">Online</span>
                    ) : (
                      <span className="text-red-700">Offline</span>
                    )}
                  </div>
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
                      (msg.message) && (msg.message !== 'Noimage')
                      && <div
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
