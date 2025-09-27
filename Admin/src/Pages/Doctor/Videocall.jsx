import { useRef, useEffect, useState } from "react";
import Peer from "peerjs";
import { useContext } from "react";
import { DoctorContext } from "../../Context/DoctorContext";
import { useSearchParams } from "react-router-dom";
import { initSocket } from "../../config/socket";
import Lottie from "lottie-react";
import loadericon from "../../../public/loading_gray.json";

const Videocall = () => {
    const { backendurl, dToken, ProfileData } = useContext(DoctorContext);
    const [searchparams] = useSearchParams();
    const userId = searchparams.get("id");

    const [peerID, setPeerID] = useState(null);
    const [remotePeerId, setRemotePeerId] = useState("");
    const [incomingCall, setIncomingCall] = useState(null);
    const [loading, setLoading] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const localStreamRef = useRef(null);
    const currentCallRef = useRef(null);

    // ---------------- Init Peer ----------------
    useEffect(() => {
        const peer = new Peer();

        peer.on("open", (id) => {
            setPeerID(id);
            console.log("✅ Doctor Peer ID:", id);
        });

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    localVideoRef.current
                        .play()
                        .catch((err) => console.error("🔴 Error playing local video:", err));
                }
                console.log("✅ Local stream ready:", stream);
            })
            .catch((err) => {
                console.error("❌ Error accessing media devices:", err);
                if (!open) alert("Please allow camera and microphone access!");
            });

        peer.on("call", (call) => {
            console.log("📞 Incoming call...");
            currentCallRef.current = call;
            setIncomingCall(call);
        });

        peerInstance.current = peer;

        return () => {
            peer.destroy();
        };
    }, []);

    // ---------------- Init Socket ----------------
    useEffect(() => {
        if (dToken && ProfileData?._id && userId && peerID) {
            if (!peerID) return;

            const newSocket = initSocket(backendurl, { docId: ProfileData?._id, message: "make_video_call" });
           
            newSocket.emit("video-initiat", {
                docId: ProfileData._id,
                doctorpeerId: peerID,
                direction: "doctor_to_user",
                userId,
            });

            newSocket.on("get-peerId", (data) => {
                if (data.userPeerId) {
                    setRemotePeerId(data.userPeerId);
                    newSocket.emit("video-initiat", {
                        docId: ProfileData._id,
                        doctorpeerId: peerID,
                        direction: "doctor_to_user",
                        userId,
                    });
                }
                if (data.doctorPeerId) {
                    setRemotePeerId(data.doctorPeerId);
                }
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [dToken, ProfileData?._id, userId, backendurl, peerID]);

    
    // ---------------- Call User ----------------
    const callUser = () => {
        if (!remotePeerId.trim()) {
            alert("❌ Please enter a valid Peer ID");
            return;
        }
        if (!localStreamRef.current) {
            alert("No local video stream available! Please check your camera and permissions.");
            return;
        }
        setLoading(true);

        setTimeout(() => {
            const call = peerInstance.current.call(remotePeerId, localStreamRef.current);
            currentCallRef.current = call;

            call.on("stream", (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current
                        .play()
                        .catch((err) => console.error("🔴 Error playing remote video:", err));
                }
                setLoading(false);
            });

            call.on("error", () => {
                setLoading(false);
            });

            call.on("close", () => {
                setLoading(false);
            });
        }, 2000);
      
    };

    // ---------------- Accept Call ----------------
    const acceptCall = () => {
        if (incomingCall && localStreamRef.current) {
            incomingCall.answer(localStreamRef.current);

            incomingCall.on("stream", (remoteStream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current
                        .play()
                        .catch((err) => console.error("🔴 Error playing remote video:", err));
                }
            });

            setIncomingCall(null);
        }
    };

    // ---------------- Decline or End Call ----------------
    const declineCall = () => {
        if (currentCallRef.current) {
            currentCallRef.current.close();
            currentCallRef.current = null;
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setRemotePeerId("");
        setIncomingCall(null);
        setLoading(false);
        
        window.location.reload();
    };

   
    return (
        <div className="flex flex-col lg:flex-row items-center justify-center p-5 gap-10 w-full min-h-screen bg-gray-100">
            {/* Remote Video */}
            <div className="w-full lg:w-[900px] h-[300px] lg:h-[500px] relative">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full bg-black h-full rounded-t-md"
                />
                {loading && (
                    <Lottie
                        className="w-40 h-40 absolute top-1/2 left-2/4 -translate-x-1/2 -translate-y-1/2"
                        animationData={loadericon}
                    />
                )}

            </div>

            {/* Sidebar */}
            <div className="flex flex-col items-center lg:items-start w-full lg:w-1/3">
                {/* Outgoing Call */}
                <div className="flex gap-2 mb-4 sm:pt-9 lg:pt-0 w-full">
                    <button
                        onClick={callUser}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        {loading?"calling...":"Call"}
                    </button>

                    <button
                        onClick={declineCall}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                        End Call
                    </button>
                </div>

                {/* Incoming Call */}
                {incomingCall && (
                    <div className="flex gap-2 mb-4 w-full">
                        <button
                            onClick={acceptCall}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        >
                            Accept
                        </button>
                        <button
                            onClick={declineCall}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Decline
                        </button>
                    </div>
                )}

                {/* Local Video */}
                <div className="w-64 h-48 bg-black rounded-md overflow-hidden">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                </div>
                <h3 className="text-center font-bold mb-1 text-sm text-gray-700">
                    Your Video
                </h3>
            </div>
        </div>
    );
};

export default Videocall;
