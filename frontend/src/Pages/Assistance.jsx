import { useContext, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import gptLogo from '../assets/chatgpt.svg';
import sendBtn from '../assets/send.svg';
import gptImgLogo from '../assets/chatgptLogo.svg';
import addBtn from '../assets/add-30.png';
import msgIcon from '../assets/message.svg';
import homeIcon from '../assets/home.svg';
import savedIcon from '../assets/bookmark.svg';
import axios from 'axios';
import { Appcontext } from '../Context/Context';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Assistance = () => {
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Hello, how can I help you?' },
    { sender: 'gpt', text: 'I am here to assist you. Ask me anything!' }
  ]);

  const [input, setInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const { backendurl, token, userData } = useContext(Appcontext);
  const navigate=useNavigate();

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');

    try {
      const { data } = await axios.post(
        `${backendurl}/api/user/assistance-response`,
        { prompt: input },
        { headers: { token } }
      );

      if (data.success) {
        if (data.symptoms && data.symptoms.length > 0) {
          // Show fixed GPT message + symptoms + doctor recommendations
          setMessages(prev => [
            ...prev,
            { sender: 'gpt', text: "Here are the recommendations based on your symptoms." }
          ]);
          setSymptoms(data.symptoms);
          setRecommendations(data.recommendations || []);
        } else {
          // No symptoms detected — show GPT text in message only
          setMessages(prev => [
            ...prev,
            { sender: 'gpt', text: data.text || "sorry No symptoms found try again" }
          ]);
          setSymptoms([]);
          setRecommendations([]);
        }
      }
    } catch (error) {
      toast.error("Something went wrong.");
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-black/85 text-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-white p-4 flex flex-col min-w-[250px]">
        <div className="flex items-center gap-2 mb-4">
          <img src={gptLogo} alt="ChatGPT Logo" className="w-8 h-8" />
          <span className="text-lg font-semibold">AI Assistant</span>
        </div>
        <button className="w-full py-2 bg-gray-700 rounded-lg mb-4 flex items-center gap-2 px-3">
          <img src={addBtn} alt="New Chat" className="w-5 h-5" /> New Chat
        </button>
        <div className="flex flex-col gap-2">
          <button className="w-full py-2 px-4 bg-gray-800 rounded-lg flex items-center gap-2">
            <img src={msgIcon} alt="Message" className="w-5 h-5" /> What is Programming?
          </button>
          <button className="w-full py-2 px-4 bg-gray-800 rounded-lg flex items-center gap-2">
            <img src={msgIcon} alt="Message" className="w-5 h-5" /> Explain AI
          </button>
          <button className="w-full py-2 px-4 bg-gray-800 rounded-lg flex items-center gap-2">
            <img src={msgIcon} alt="Message" className="w-5 h-5" /> How does React work?
          </button>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-700 flex flex-col gap-2">
          <button className="w-full py-2 px-4 bg-gray-800 rounded-lg flex items-center gap-2" 
          onClick={()=>navigate('/home')}>
            <img src={homeIcon} alt="Home" className="w-5 h-5"  /> Home
          </button>
          <button className="w-full py-2 px-4 bg-gray-800 rounded-lg flex items-center gap-2">
            <img src={savedIcon} alt="Saved" className="w-5 h-5" /> Saved
          </button>
         
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ScrollToBottom className="flex-1 overflow-y-auto p-4">
          {messages?.map((msg, index) => (
            <div key={index} className="flex items-start gap-2 mb-4">
              <img
                src={msg.sender === 'user' ? userData?.image : gptImgLogo}
                alt={msg.sender}
                className="w-8 h-8 rounded-lg"
              />
              <p
                className={`p-3 rounded-lg max-w-lg ${
                  msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              >
                {msg.text}
              </p>
            </div>
          ))}

          {symptoms.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
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
              <h3 className="text-lg font-semibold mb-2">Recommended Doctors: <span className='text-lg text-pink-500'>(Priority Wise)</span></h3>
              <ul className="space-y-3">
                {recommendations?.map((doc, index) => (
                  <li key={index} className="border-b border-gray-700 pb-2">
                    <p className="font-medium">
                     {index+1} {doc.name} — {doc.specialty}
                    </p>
                    <p className="text-sm text-gray-300">{doc.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ScrollToBottom>

        {/* Input box */}
        <div className="p-4 border-t border-gray-700 flex items-center">
          <input
            type="text"
            className="flex-1 p-2 bg-gray-800 rounded-lg outline-none text-white"
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="ml-2 p-2 bg-blue-500 rounded-lg hover:bg-blue-600"
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
