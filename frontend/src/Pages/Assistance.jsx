import { useContext, useState, useRef, useEffect } from 'react';
import sendBtn from '../assets/send.svg';
import homeIcon from '../assets/home.svg';
import closeIcon from '../assets/cross_icon.png';
import arrowIcon from '../assets/arrow_icon.svg';
import axios from 'axios';
import { Appcontext } from '../Context/Context';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import loaderanimation from '../assets/loader.json';
import { AiOutlineRobot } from 'react-icons/ai';

const Assistance = () => {
  const [messages, setMessages] = useState([
    { sender: 'gpt', text: 'Hello, how can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { backendurl, token, userData } = useContext(Appcontext);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/assistance-response`,
        { prompt: input },
        { headers: { token } }
      );

       console.log(data);
      if (data.success) {
        if (data.symptoms?.length > 0) {
          // Medical response
          setMessages((prev) => [
            ...prev,
            {
              sender: 'gpt',
              text: 'Based on your symptoms, here are some doctor recommendations.',
            },
          ]);
          setSymptoms(data.symptoms);
          setRecommendations(data.recommendations || []);
        } else {
          // General response
          setMessages((prev) => [
            ...prev,
            { sender: 'gpt', text: data.message || 'I am here to help!' },
          ]);
          setSymptoms([]);
          setRecommendations([]);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  return (
   
    <div className=" md:static w-screen lg:w-[100%]  top-0 left-0 z-40 flex h-screen text-white bg-black/90 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 z-40 h-full w-[250px] bg-black border-r border-white 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex justify-between items-center p-4 md:hidden">
          <span className="text-lg font-semibold">AI Assistant</span>
          <button onClick={() => setSidebarOpen(false)}>
            <img src={closeIcon} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 p-4 mb-2">
          <AiOutlineRobot className="w-8 h-8 text-blue-500" />
          <span className="text-lg font-semibold">AI Assistant</span>
        </div>

        <div className="p-4">
          <button
            className="w-full py-2 px-4 bg-gray-800 rounded-lg flex items-center gap-2"
            onClick={() => {
              navigate('/home');
              setSidebarOpen(false);
            }}
          >
            <img src={homeIcon} alt="Home" className="w-5 h-5" />
            Home
          </button>
        </div>
      </div>

      {/* Sidebar Toggle */}
      {!sidebarOpen && (
        <div className="md:hidden fixed top-4 left-2 z-50 bg-black border p-2 rounded-md shadow-md">
          <button onClick={() => setSidebarOpen(true)}>
            <img src={arrowIcon} alt="Open Sidebar" className="w-6 h-6 invert" />
          </button>
        </div>
      )}

      {/* Chat Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg, index) => (
            <div key={index} className="flex items-start gap-2">
              {msg.sender === 'user' ? (
                <img
                  src={userData?.image}
                  alt="User"
                  className="w-8 h-8 rounded-lg"
                />
              ) : (
                <AiOutlineRobot className="w-8 h-8 text-blue-500" />
              )}
              <div
                className={`p-3 rounded-lg max-w-lg whitespace-pre-line ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2">
              <AiOutlineRobot className="w-8 h-8 text-blue-500" />
              <div className="p-3 rounded-lg max-w-lg bg-gray-600">
                <Lottie className="w-40 h-40" animationData={loaderanimation} loop />
              </div>
            </div>
          )}

          {symptoms.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Extracted Symptoms:</h3>
              <ul className="list-disc pl-5">
                {symptoms.map((symptom, index) => (
                  <li key={index}>{symptom}</li>
                ))}
              </ul>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                Recommended Doctors: <span className="text-pink-500">(Priority Wise)</span>
              </h3>
              <ul className="space-y-3">
                {recommendations.map((doc, index) => (
                  <li key={index} className="border-b border-gray-700 pb-2">
                    <p className="font-medium">
                      {index + 1}. {doc.name} — {doc.specialty}
                    </p>
                    <p className="text-sm text-gray-300">{doc.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Input */}
        <div className=" p-4 border-t border-gray-700 flex items-center">
          <input
            type="text"
            className="flex-1 p-2 bg-gray-800 rounded-lg outline-none text-white border"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="ml-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-800 border"
            onClick={handleSend}
          >
            <img src={sendBtn} alt="Send" className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>

  );
};

export default Assistance;
