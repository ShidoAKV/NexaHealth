import React, { useState, useEffect, useContext } from "react";
import { Appcontext } from "../Context/Context";
import axios from "axios";
import io from "socket.io-client";
import useSound from "use-sound";
import ScrollToBottom from "react-scroll-to-bottom";
import { MdOutlineVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ChatApp = () => {
  const [playSound] = useSound("MessageNotification.mp3");
  const { backendurl, token, userData } = useContext(Appcontext);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [socket, setSocket] = useState(null);
  const [doctorStatus, setDoctorStatus] = useState({});
  const navigate = useNavigate();

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

      setSocket(newSocket);

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
          console.error("Error fetching messages:", error);
          setMessages([]);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [backendurl, token, selectedDoctor, userData]);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleSendMessage = async () => {
    if (userMessage.trim() && selectedDoctor) {
      try {
        const newMessage = {
          senderId: userData?._id,
          receiverId: selectedDoctor?._id,
          message: userMessage,
        };

        const { data } = await axios.post(
          `${backendurl}/api/chat/user/send`,
          newMessage,
          { headers: { token } }
        );

        if (data.success) {
          setMessages((prev) => [...prev, data.data]);
          setUserMessage("");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen pr-36">
      {/* Left Panel: Appointments */}
      <div className="w-1/3 bg-white p-4 border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
          My Appointments
        </h2>
        <div className="overflow-y-auto max-h-full">
          {appointments
            .filter(
              (appointment, index, self) =>
                index ===
                self.findIndex((a) => a.docData?._id === appointment.docData?._id)
            )
            .map((doc) => (
              <div
                key={doc.docData._id}
                className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectDoctor(doc.docData)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={doc.docData?.image || ""}
                    alt="Doctor"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900">{doc.docData?.name}</p>
                    <p className="text-sm text-gray-600">{doc.docData?.speciality}</p>
                  </div>
                  <span>click for<strong>online</strong> status</span>
                  <div>
                    {doctorStatus[doc.docData._id] === "online" ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-red-500">Offline</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex-grow bg-gray-50 p-4">
        {selectedDoctor ? (
          <div className="bg-white shadow-lg rounded-lg p-4 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Chat with {selectedDoctor.name}
            </h2>
            <ScrollToBottom className="overflow-y-auto flex-grow p-2 bg-gray-50 border border-gray-300 rounded-md mb-4">
              {Array.isArray(messages) &&
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-center mb-2 space-x-2 relative ${
                      msg.senderId === userData._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.senderId === userData._id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <small className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
            </ScrollToBottom>
            <div className="flex items-center border-t pt-2">
              <MdOutlineVideoCall
                onClick={() => navigate("/videocall")}
                className="h-9 w-8 hover:bg-slate-200 mr-1 rounded-sm cursor-pointer"
              />
              <input
                type="text"
                className="flex-grow p-2 border rounded-l-md focus:outline-none"
                placeholder="Type a message"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
              />
              <button
                onClick={handleSendMessage}
                className="bg-green-500 text-white p-2 rounded-r-md hover:bg-green-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-600">
            <p>Select a doctor to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
