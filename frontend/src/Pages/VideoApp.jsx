import { useRef, useEffect, useState } from "react";
import Peer from "peerjs";
import { FaVolumeMute } from "react-icons/fa";
import { VscUnmute } from "react-icons/vsc";

const VideoApp = () => {
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
                if (!open) alert("Please allow camera and microphone access!");
            });

        peer.on("call", (call) => {
            console.log("📞 Incoming call...");
            if (localStreamRef.current) {
                call.answer(localStreamRef.current);
                call.on("stream", (remoteStream) => {
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
            alert("No local video stream available! Please check your camera and permissions.");
            return;
        }

        const call = peerInstance.current.call(remotePeerId, localStreamRef.current);
        call.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
                remoteVideoRef.current.play().catch(err => console.error("🔴 Error playing remote video:", err));
            }
        });
    };

    const toggleAudioIcon = () => setOpen(!open);

    const copyPeerID = () => {
        if (peerID) {
            navigator.clipboard.writeText(peerID);
            alert("✅ Peer ID copied to clipboard!");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center p-5 gap-10 w-full min-h-screen bg-gray-100">
            {/* Remote Video */}
            <div className="w-full lg:w-[900px] h-[300px] lg:h-[500px] relative">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full bg-black rounded-t-md"
                />
                <div className="bg-black p-2 flex items-center justify-start gap-2 rounded-b-md">
                    {open ? (
                        <FaVolumeMute
                            onClick={toggleAudioIcon}
                            className="text-white bg-blue-600 hover:bg-blue-800 p-2 rounded-full cursor-pointer w-10 h-10"
                        />
                    ) : (
                        <VscUnmute
                            onClick={toggleAudioIcon}
                            className="text-white bg-blue-600 hover:bg-blue-800 p-2 rounded-full cursor-pointer w-10 h-10"
                        />
                    )}
                </div>
            </div>

            {/* Sidebar: Local Video + Input + Info */}
            <div className="flex flex-col items-center lg:items-start w-full lg:w-1/3">
                <div className="flex gap-2 mb-4 sm:pt-9 lg:pt-0 w-full">
                    <input
                        type="text"
                        placeholder="Enter Remote Peer ID"
                        value={remotePeerId}
                        onChange={(e) => setRemotePeerId(e.target.value)}
                        className="flex-grow border border-gray-400 p-2 rounded-md"
                    />
                    <button
                        onClick={callUser}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Call
                    </button>
                </div>

                {/* Peer ID + Copy Button */}
                <div className="mb-6 w-full text-center">
                    <h2 className="font-semibold text-md">Joining ID:</h2>
                    <div className="flex justify-center items-center gap-2 mt-1">
                        <p className="text-blue-700 text-sm break-all">{peerID}</p>
                        <button
                            onClick={copyPeerID}
                            className="bg-gray-400 hover:bg-gray-500 hover:text-white text-sm px-2 py-1 rounded-md"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Local Video */}
                <div className="w-64 h-48 bg-black rounded-md overflow-hidden">
                    <h3 className="text-center font-bold mb-1 text-sm text-gray-700">Your Video</h3>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoApp;
