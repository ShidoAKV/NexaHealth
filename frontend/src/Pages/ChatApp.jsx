import { useState, useEffect, useContext } from "react";
import { Appcontext } from "../Context/Context";
import axios from "axios";
import io from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import { MdOutlineVideoCall } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";
import loaderanimation from '/public/loader.json'
import Lottie from "lottie-react";
import { FaFilePdf, FaTimes } from "react-icons/fa";

const ChatApp = () => {

  const { backendurl, token, userData, setLoading } = useContext(Appcontext);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const navigate = useNavigate();

  const [Image, setImage] = useState(null);
  const [loading, setloading] = useState(false);
  const [dataindex, setDataindex] = useState(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [doctorstatus, setdoctorstatus] = useState({});



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
    if (token && userData?._id) {

      const onlineSocket = io(backendurl,
        { query: { personId: userData?._id } }
      );


      // creating the online socket
      onlineSocket.emit("online-register", {
        personId: userData._id
      });

      onlineSocket.on("online-users", (users) => {
        const userStatusMap = {};
        users.forEach(({ userId, status }) => {
          userStatusMap[userId] = status;
        });
        setdoctorstatus(userStatusMap);
      });


      return () => {
        onlineSocket.disconnect();
      };
    }
  }, [token, userData, backendurl])



  useEffect(() => {
    if (token && selectedDoctor?._id && userData?._id) {
      const newSocket = io(backendurl, {
        query: { userId: userData._id },
      });

      newSocket.on("status-update", ({ userId, status }) => {
        setdoctorstatus((prev) => ({ ...prev, [userId]: status }));
      });

      newSocket.on("newMessage", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      newSocket.emit("register-chat", {
        userId: userData._id,
        docId: selectedDoctor._id,
      });


      // newSocket.on("online-users", (user) => {
      //   console.log(user);

      //   setdoctorstatus(user)
      // })

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
          setLoading(true);
          const { data } = await axios.get(`${backendurl}/api/user/appointments`, {
            headers: { token },
          });
          if (data.success) {
            setLoading(false);
            setAppointments(data.appointments.reverse());
          }
        } catch (error) {
          setLoading(false);
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
    if (pdfFile && pdfFile.type === "application/pdf") {
      await handlesendpdf();
    } else {
      if (userMessage.trim() || Image) {
        try {

          let base64Image = null;

          if (Image) {
            setloading(true);
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
                setloading(false);
                setMessages((prev) => [...prev, data.data]);
                setImage(null);
                setUserMessage("");
              } else {
                setloading(false);
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
    }
  };



  const handlesendpdf = async () => {
    if (!pdfFile || pdfFile.type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }

    try {

      setloading(true);

      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("senderId", userData?._id);
      formData.append("receiverId", selectedDoctor?._id);

      const { data } = await axios.post(
        `${backendurl}/api/chat/user/send-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
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
      setloading(false);
    }
  };
  const handledelete = async (docId) => {
    try {

      const { data } = await axios.post(`${backendurl}/api/chat/user/delete-chat`,
        { senderId: userData?._id, receiverId: docId },
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
  const removeAttachment = () => setPdfFile(null);
  const removeimageAttachment = () => setImage(null);


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
                   <div className="relative">
                  <img
                    src={doc.docData?.image || ""}
                    alt="Doctor"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <span
                    className={`absolute left-0 bottom-0 top-0 right-0 block w-3 h-3 rounded-full border-2 border-gray-900 ${doctorstatus[doc.docData._id] === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                  ></span>
                  </div>



                  <div className="flex-grow">
                    <p className="font-medium text-gray-300">{doc.docData?.name}</p>
                    <p className="text-sm text-gray-400">{doc.docData?.speciality}</p>
                  </div>

                  <button
                    onClick={() => handledelete(doc?.docData?._id)}
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
              {messages && Array.isArray(messages) &&
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
                      (msg.message.trim() !== "nexahealthpdf" && msg.message.trim() !== "Noimage") && <div className={`p-3 rounded-lg max-w-xs ${msg.senderId === userData._id
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
                  style={{ filter: "invert(80%) sepia(100%) saturate(500%) hue-rotate(180deg)" }}
                  loop={true} />
              }
            </ScrollToBottom>

            <div className="flex items-center border-t pt-2 bg-gray-900 p-2 rounded-md">

              <MdOutlineVideoCall
                onClick={() => navigate(`/videocall?id=${selectedDoctor._id}`)}
                className="h-9 w-10 mx-1 text-gray-300 hover:bg-gray-700 p-1 rounded-sm cursor-pointer"
              />


              {/* Message Box */}
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
                          onChange={(e) => { setImage(e.target.files[0]), setShowOptions(false) }}
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
                          onChange={(e) => { setPdfFile(e.target.files[0]), setShowOptions(false) }}
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
                {(Image) && <div className=" flex items-center gap-2 bg-gray-800 text-white p-2 rounded-md mr-2">
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
                  className="flex-grow p-2 bg-transparent text-white border-none focus:outline-none"
                  placeholder="Type a message"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e)}

                />
              </div>

              {/* Send Button */}
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
