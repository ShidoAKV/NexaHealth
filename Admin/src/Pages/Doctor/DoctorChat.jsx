import React, { useState, useEffect, useContext } from "react";
import { DoctorContext } from "../../Context/DoctorContext";
import axios from "axios";
import io from 'socket.io-client';
import useSound from 'use-sound';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useNavigate } from "react-router-dom";
import { MdOutlineVideoCall } from "react-icons/md";

const DoctorChat = () => {

  const [playSound] = useSound('Notification.mp3');
  const { getAppointments, appointments, backendurl, dToken, ProfileData } = useContext(DoctorContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [deleteMsg, setdeleteMsg] = useState(false);
   const navigate=useNavigate();



  useEffect(() => {
    if (dToken && ProfileData?._id) {
      const newSocket = io(backendurl, {
        query: {
          docId: ProfileData._id,
        },
      });

      setSocket(newSocket);

      newSocket.on("newMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        playSound();
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [backendurl, dToken, ProfileData]);

  useEffect(() => {
    // Fetch appointments on component mount
    getAppointments();
  }, [getAppointments]);

  useEffect(() => {

    if (selectedUser) {
      // Fetch messages for the selected user
      const fetchMessages = async () => {
        try {
          const response = await axios.post(
            `${backendurl}/api/chat/doctor/fetchchat`,
            { appointmentId: selectedUser._id },
            { headers: { dToken } }
          );

          if (response.data.success) {
            setMessages(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [selectedUser, backendurl, dToken]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages for the new user
  };



  const handleSendMessage = async () => {
    if (message.trim() && selectedUser) {
      const newMessage = {
        appointmentId: selectedUser._id,
        senderId: "doctor",
        receiverId: selectedUser.userId,
        message,
      };

      try {
        const response = await axios.post(
          `${backendurl}/api/chat/doctor/send`,
          newMessage,
          { headers: { dToken } }
        );

        if (response.data.success) {
          setMessages((prev) => [...prev, response.data.data]); // Append new message
          setMessage(""); // Clear input field
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };
  const handleDeleteMessage = async (Id) => {
    try {
      // Optimistic UI Update: Empty the message immediately from the local state (messages)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === Id ? { ...msg, message: "" } : msg
        )
      ); // Empty message locally

      // Emit the event to other clients to update the message in real-time
      socket.emit('chatDeleted', Id);

      // Make the API call to empty the message in the backend (server)
      const { data } = await axios.post(`${backendurl}/api/chat/deletechat`, { chatid: Id });

      // If the API call is successful, log success, otherwise rollback the optimistic update
      if (!data.success) {
        console.log('Failed to empty message in database, rolling back UI update');
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === Id ? { ...msg, message: "Error emptying message" } : msg
          )
        ); // Rollback if needed
      } else {
        console.log('Message emptied in database');
      }
    } catch (error) {
      console.error('Error emptying message:', error);

      // In case of an error, roll back the optimistic update and show error
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === Id ? { ...msg, message: "Error emptying message" } : msg
        )
      ); // Rollback to restore the message if an error occurs
    }
  };

  //  console.log(ProfileData);


  return (
    <div className="flex h-screen w-screen">
      {/* Left panel: List of users */}
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
            .map((appointment) => (
              <div
                key={appointment._id}
                className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelectUser(appointment)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={appointment.userData?.image || ""}
                    alt="User"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900">
                      {appointment.userData?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.userData?.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Right panel: Chat UI */}
      <div className="flex-grow bg-gray-50 p-4">
        {selectedUser ? (
          <div className="bg-white shadow-lg rounded-lg p-4 h-full flex flex-col">
            <div className="text-xl font-semibold mb-4 text-center text-gray-700">
              Chat with {selectedUser.userData?.name}
            </div>
            <ScrollToBottom className="overflow-y-auto flex-grow p-2 bg-gray-50 border border-gray-300 rounded-md mb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.senderId === "doctor" ? "justify-end" : "justify-start"
                    } mb-2 relative`}
                  onMouseEnter={() => setHoveredMessage(index)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >

                  {hoveredMessage === index && msg.senderId === ProfileData._id && (
                    <button
                      className="absolute top-1 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md hover:bg-red-600"
                      onClick={() => {
                        handleDeleteMessage(msg?._id);
                        setdeleteMsg(true);
                      }}
                    >
                      Delete
                    </button>
                  )}

                  <div
                    className={`p-3 rounded-lg max-w-xs ${msg.senderId === "doctor"
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
                onClick={() => navigate('/doctor-videocall')}
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
            <p>Select a patient to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChat;
