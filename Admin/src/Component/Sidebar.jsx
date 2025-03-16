import  { useContext } from 'react';
import { AdminContext } from '../Context/AdminContext';
import { NavLink } from 'react-router-dom';
import { assets } from '../../../frontend/src/assets/assets';
import { DoctorContext } from '../Context/DoctorContext';

const Sidebar = () => {
    const { aToken } = useContext(AdminContext);
    const {dToken}=useContext(DoctorContext);
    return (
        <div className="min-h-screen w-64 bg-white border-r shadow-lg">
            {aToken && (
                <ul className="flex flex-col text-gray-700">
                    <NavLink
                        to="/admin-dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Dashboard Icon"
                            className="h-5 w-5"
                        />
                        <p>Dashboard</p>
                    </NavLink>
                    <NavLink
                        to="/all-appointments"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Appointments Icon"
                            className="h-5 w-5"
                        />
                        <p>Appointment</p>
                    </NavLink>
                    <NavLink
                        to="/add-doctors"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600   border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Add Doctor Icon"
                            className="h-5 w-5"
                        />
                        <p>Add Doctor</p>
                    </NavLink>
                    <NavLink
                        to="/doctor-list"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Doctor List Icon"
                            className="h-5 w-5"
                        />
                        <p>Doctor List</p>
                    </NavLink>

                </ul>
            )}

         {dToken && (
                <ul className="flex flex-col text-gray-700">
                    <NavLink
                        to="/doctor-dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Dashboard Icon"
                            className="h-5 w-5"
                        />
                        <p>Dashboard</p>
                    </NavLink>

                    <NavLink
                        to="/doctor-appointments"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Appointments Icon"
                            className="h-5 w-5"
                        />
                        <p>Appointment</p>
                    </NavLink>

                    <NavLink
                        to="/doctor-profile"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Doctor List Icon"
                            className="h-5 w-5"
                        />
                        <p>Profile</p>
                    </NavLink>

                    <NavLink
                        to="/doctor-chat"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Doctor List Icon"
                            className="h-5 w-5"
                        />
                        <p>Chat</p>
                    </NavLink>

                    <NavLink
                        to="/doctor-generate-form"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-6 py-4 hover:bg-blue-50 hover:text-blue-600 transition ${
                                isActive ? 'bg-blue-100 text-blue-600 border-r-4 border-blue-600' : ''
                            }`
                        }
                    >
                        <img
                            src={assets.arrow_icon}
                            alt="Doctor List Icon"
                            className="h-5 w-5"
                        />
                        <p>Medical Form</p>
                    </NavLink>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;
