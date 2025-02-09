import React, { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../Context/DoctorContext";
import axios from "axios";
import io from "socket.io-client";
import useSound from "use-sound";
import ScrollToBottom from "react-scroll-to-bottom";
import { useNavigate } from "react-router-dom";
import { MdOutlineVideoCall } from "react-icons/md";

const DoctorChat = () => {
  const [playSound] = useSound("Notification.mp3");
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
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedUser, backendurl, dToken, ProfileData, socket]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (!docmessage.trim() || !selectedUser) return;

    const tempMessage = {
      _id: Date.now().toString(),
      senderId: ProfileData._id,
      receiverId: selectedUser._id,
      message: docmessage,
      timestamp: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const { data } = await axios.post(
        `${backendurl}/api/chat/doctor/send`,
        tempMessage,
        { headers: { dToken } }
      );

      if (data.success) {
        // Replace temp message with actual message from backend
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempMessage._id ? data.data : msg))
        );
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
    } finally {
      docSetMessage("");
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-1/3 bg-white p-4 border-r border-gray-300">
        <div className="text-xl font-semibold mb-4 text-center text-gray-700">
          My Patients
        </div>
        <div className="overflow-y-auto max-h-full">
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
                className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectUser(user.userData)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.userData.image || ""}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900">{user.userData.name}</p>
                    <p className="text-sm text-gray-600">{user.userData.email}</p>
                  </div>
                  <div>
                    {userstatus[user.userData._id] === "online" ? (
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

      <div className="flex-grow bg-gray-50 p-4">
        {selectedUser ? (
          <div className="bg-white shadow-lg rounded-lg p-4 h-full flex flex-col">
            <div className="text-xl font-semibold mb-4 text-center text-gray-700">
              Chat with {selectedUser.name}
            </div>
            <ScrollToBottom className="overflow-y-auto flex-grow p-2 bg-gray-50 border border-gray-300 rounded-md mb-4">
              {Array.isArray(messages) &&
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-center mb-2 space-x-2 relative ${
                      msg.senderId === ProfileData._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.senderId === ProfileData._id
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
                onClick={() => navigate("/doctor-videocall")}
                className="h-9 w-8 hover:bg-slate-200 mr-1 rounded-sm cursor-pointer"
              />
              <input
                type="text"
                className="flex-grow p-2 border rounded-l-md focus:outline-none"
                placeholder="Type a message"
                value={docmessage}
                onChange={(e) => docSetMessage(e.target.value)}
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
            <p>Select a patient to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;
