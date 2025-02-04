import React, { useState, useEffect, useContext } from "react";
import { Appcontext } from "../Context/Context";
import axios from "axios";
import io from "socket.io-client";
import useSound from 'use-sound';
import ScrollToBottom from 'react-scroll-to-bottom';
import { MdOutlineVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";
const ChatApp = () => {
  
  const [playSound] = useSound('MessageNotification.mp3');
  const { backendurl, token, userData } = useContext(Appcontext);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentAppointmentId, setCurrentAppointmentId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [hoveredMessage, setHoveredMessage]=useState(null);
  const [deleteMsg, setdeleteMsg] = useState(false);
  const navigate=useNavigate();

  
  useEffect(() => {
    if (token && selectedDoctor?._id && currentAppointmentId && userData?._id) {
      const newSocket = io(backendurl, {
        query: {
          userId: userData._id,
          appointmentId: currentAppointmentId,
        },
      });

      setSocket(newSocket);

      newSocket.on("newMessage", (newMessage) => {
        playSound();
        setMessages((prev) => [...prev, newMessage]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, selectedDoctor, currentAppointmentId, backendurl, userData]);

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
    if (currentAppointmentId) {
      const fetchMessages = async () => {
        try {
          const { data } = await axios.post(
            `${backendurl}/api/chat/user/fetchchat`,
            { appointmentId: currentAppointmentId },
            { headers: { token } }
          );
          if (data.success) {
            setMessages(data.data);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [backendurl, token, currentAppointmentId]);


  const handleSelectDoctor = (doctor, appointmentId) => {
    setSelectedDoctor(doctor);
    setCurrentAppointmentId(appointmentId);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (message.trim() && currentAppointmentId && selectedDoctor) {
      try {
        const newMessage = {
          appointmentId: currentAppointmentId,
          senderId: userData._id,
          receiverId: selectedDoctor._id,
          message,
        };

        const { data } = await axios.post(`${backendurl}/api/chat/user/send`, newMessage, {
          headers: { token },
        });

        if (data.success) {
          setMessages((prev) => [...prev, data.data]);
          setMessage("");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleDeleteMessage = async (Id) => {
    try {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === Id ? { ...msg, message: "" } : msg
        )
      );

      socket.emit('chatDeleted', Id);

      const { data } = await axios.post(`${backendurl}/api/chat/deletechat`, { chatid: Id });
  
      if (!data.success) {
        setMessages((prevMessages) => [...prevMessages, { _id: Id }]);
      } else {
        console.log('Message deleted from database');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setMessages((prevMessages) => [...prevMessages, { _id: Id }]); // Rollback to add back the message
    }
  };
  
  return (
    <div className="flex h-screen w-screen pr-36">
      {/* Left Panel: List of Appointments */}
      <div className="w-1/3 bg-white p-4 border-r border-gray-300">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">My Appointments</h2>
        <div className="overflow-y-auto max-h-full">
          {appointments
            .filter(
              (appointment, index, self) =>
                index === self.findIndex((a) => a.docData?._id === appointment.docData?._id)
            )
            .map((appointment) => (
              <div
                key={appointment._id}
                className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectDoctor(appointment.docData, appointment._id)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={appointment.docData?.image || ""}
                    alt="Doctor"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900">{appointment.docData?.name}</p>
                    <p className="text-sm text-gray-600">{appointment.docData?.speciality}</p>
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
            <h2 className="  text-xl font-semibold mb-4 text-center text-gray-700">
              Chat with {selectedDoctor.name}
              
            </h2>
           
            <ScrollToBottom className="overflow-y-auto flex-grow p-2 bg-gray-50 border border-gray-300 rounded-md mb-4">
              {messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex items-center mb-2 space-x-2 relative ${
                    msg.senderId === userData._id ? "justify-end" : "justify-start"
                  }`}
                  onClick={() => setHoveredMessage(msg._id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  {hoveredMessage === msg._id && msg.senderId === userData._id && (
                    <button
                      className="absolute top-3 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md hover:bg-red-600"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      Delete
                    </button>
                  )}
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
              onClick={()=>navigate('/videocall')}
              className=" h-9 w-8 hover:bg-slate-200 mr-1 rounded-sm cursor-pointer"
              />
              
              <input
                type="text"
                className="flex-grow p-2 border rounded-l-md focus:outline-none"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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

