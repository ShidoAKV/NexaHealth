import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken, setaToken] = useState(localStorage.getItem('aToken') || '');
    const [doctors, setdoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const backendurl = import.meta.env.VITE_BACKEND_URL;
    const [dashData, setDashData] = useState(false);

    const getalldoctors = async () => {
        try {

            const { data } = await axios.post(
                backendurl + '/api/admin/all-doctors', {}, { headers: { aToken } }
            );
            //  console.log(data);

            if (data.success === 'true') { // Assuming success is a boolean
                setdoctors(data.doctors);
                // console.log(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            // Validate docId
            if (!docId) {
                toast.error("Doctor ID is required");
                return;
            }

            const { data } = await axios.post(
                backendurl + '/api/admin/change-availability',
                { docId },
                { headers: { aToken } }
            );

            if (data.success) {
                toast.success(data.message);
                getalldoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getAllappointments = async () => {

        try {
            const { data } = await axios.get(backendurl + '/api/admin/appointments', { headers: { aToken } });
            if (data.success) {
               
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }


        } catch (error) {
            toast.error(error.message);
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendurl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } });

            if (data.success) {
                toast.success(data.message);
                getAllappointments();
            }else{
                toast.error(data.message);
            }


        } catch (error) {
            toast.error(error.message)
        }
    }

    const getDashData=async()=>{
         try {
             const {data}=await axios.get(backendurl+'/api/admin/dashboard',{headers:{aToken}});
             if(data.success){
              setDashData(data.dashData);
            //   console.log(data.dashData);
              
             }else{
                toast.error(data.message);
             }
         } catch (error) {
            toast.error(error.message)
         }
    }


    const value = {
        aToken, setaToken,
        backendurl,
        doctors, setdoctors,
        getalldoctors,
        changeAvailability,
        appointments, setAppointments,
        getAllappointments,cancelAppointment,
        dashData,getDashData

    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
