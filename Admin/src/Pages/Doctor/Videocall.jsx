import React, { useRef, useEffect, useState } from "react";
import Peer from "peerjs";
import { FaVolumeMute } from "react-icons/fa";
import { VscUnmute } from "react-icons/vsc";


const Videocall = () => {
    const [peerID, setPeerID] = useState(null);
    const [remotePeerId, setRemotePeerId] = useState("");
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const localStreamRef = useRef(null);
    const [open, setOpen] = useState(true);


    useEffect(() => {
        const peer = new Peer();

        peer.on("open", (id) => {
            setPeerID(id);
            console.log("✅ My Peer ID:", id);
        });

        // Get user media immediately on mount
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current.play().catch(err => console.error("🔴 Error playing local video:", err));
                }
                console.log("✅ Local stream obtained:", stream);
            })
            .catch((err) => {
                console.error("❌ Error accessing media devices:", err);
              if(!open)  alert("Please allow camera and microphone access!");
            });

        peer.on("call", (call) => {
            console.log("📞 Incoming call...");
            if (localStreamRef.current) {
                call.answer(localStreamRef.current);
                console.log("✅ Answered call with local stream.");
                call.on("stream", (remoteStream) => {
                    console.log("✅ Remote stream received:", remoteStream);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream;
                        remoteVideoRef.current.play().catch(err => console.error("🔴 Error playing remote video:", err));
                    }
                });
            } else {
                console.error("❌ No local stream available to answer call!");
            }
        });

        peerInstance.current = peer;

        return () => {
            peer.destroy();
        };
    }, []);

    const callUser = () => {
        if (!remotePeerId.trim()) {
            alert("❌ Please enter a valid Peer ID");
            return;
        }

        if (!localStreamRef.current) {
            console.error("❌ No local stream available! Make sure the camera is accessible.");
            alert("No local video stream available! Please check your camera and permissions.");
            return;
        }

        console.log("📞 Calling peer:", remotePeerId);
        const call = peerInstance.current.call(remotePeerId, localStreamRef.current);

        call.on("stream", (remoteStream) => {
            console.log("✅ Received remote stream:", remoteStream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(err => console.error("🔴 Error playing remote video:", err));
            }
        });
    };

    const handlechange=()=>{
        setOpen(!open);
    }

    return (
          <div className="flex flex-row-reverse items-center p-5 ">
                    <div  className="pl-8 flex-col pt-20 ">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Enter Remote Peer ID" 
                                value={remotePeerId}  
                                onChange={(e) => setRemotePeerId(e.target.value)}
                                className="border p-2 rounded-md mb-4"
                            />
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:scale-105 hover:ease-in-out hover:transition-all hover:bg-blue-800" 
                                onClick={callUser}
                            >
                                Call
                            </button>
                        </div>
                        
                     <h2 className="text-lg font-bold ">Joining ID:</h2>
                      <strong className="text-red-800 "> {peerID}</strong>
                        <div className="pt-40">
                            <h3 className="text-center font-bold">Your</h3>
                            <div className="h-60 w-72">
                                <video ref={localVideoRef} autoPlay muted playsInline className="border rounded-md w-64 h-48 bg-black" />
                            </div>
        
                        </div>
                    </div>
                    
                    <div className="flex gap-4  ">
                        <div className="h-[500px] w-[900px] ">
                             <video ref={remoteVideoRef} autoPlay playsInline  className=" rounded-t-md h-[100%] w-[100%] bg-black" />
                             <div className="bg-black flex rounded-b-md ">
                                    <div className="  pl-4 h-10 mb-3">
                                    { open?
                                     (<FaVolumeMute 
                                       onClick={()=>handlechange()}
                                       className=" w-10 h-8 mt-1  rounded-xl cursor-pointer  bg-blue-500 " />
                                      )
                                       :(<VscUnmute 
                                         onClick={()=>handlechange()}
                                         className=" w-10 h-8 mt-1  rounded-xl cursor-pointer bg-blue-500 "
                                       />)
                                    }
                                    </div>
                                   
                            </div>
                        </div>
                    </div>
          </div>
    );
};

export default Videocall;
