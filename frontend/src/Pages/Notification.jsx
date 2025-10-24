import { useContext, useEffect, useState } from "react";
import { Appcontext } from "../Context/Context.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Notification = () => {
    const { token, userData, backendurl, setLoading } = useContext(Appcontext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userData?._id) return;

            try {
                setLoading(true);
                const { data } = await axios.get(
                    `${backendurl}/api/user/notification/${userData?._id}`,
                    { headers: { token } }
                );
                 
                if (data.success) {
                    setNotifications(data.appointments);
                    setLoading(false);
                }else{
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
                toast.error(error.message);
            }
        };

        fetchNotifications();
    }, [userData, backendurl, token]);



    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

            {notifications.length === 0 ? (
                <p>No notifications yet.</p>
            ) : (
                <div className="max-w-xl mx-auto p-4">
                    <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg p-2">
                        <ul className="space-y-4">
                            {notifications?.map((notif) => (
                                <li
                                    key={notif._id}
                                    className="border rounded-lg p-4 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <img
                                        src={notif.docData?.image}
                                        alt={notif.docData?.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">
                                            Appointment with Dr. {notif.docData?.name}{" "}
                                            <span className="text-sm text-gray-500">
                                                ({notif.docData?.speciality})
                                            </span>
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Date: {notif.slotDate.replace(/_/g, "/")} | Time: {notif.slotTime}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            )}
        </div>
    );
};

export default Notification;
