// Context/NotificationContext.jsx
import { createContext, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import { Appcontext } from "./Context";
import { toast } from "react-toastify";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { userData, backendurl } = useContext(Appcontext);

    useEffect(() => {
        if (!userData) return;

        const newSocket = io(backendurl, {
            query: {
                notificationdata: true,
                userId: userData?._id
            }
        });

        newSocket.on("appointmentNotification", (data) => {
            toast.info(data.message, { position: "top-center", autoClose: 5000 });
        });

        const handleBeforeUnload = () => {
            newSocket.emit("removeUser", userData._id);
            newSocket.disconnect();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            newSocket.disconnect();
        };
    }, [userData?._id]);


    return (
        <NotificationContext.Provider>
            {children}
        </NotificationContext.Provider>
    );
}
