import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const Appcontext = createContext();

const Appcontextprovider = ({children}) => {
  const currencySymbol = "$";
  const backendurl = import.meta.env.VITE_BACKEND_URL;
  const doctorurl = import.meta.env.VITE_DOCTOR_URL;
  const [doctors, setdoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(false);



  const getDoctorData = async () => {
    try {
       setLoading(true);
      const { data } = await axios.get(`${backendurl}/api/doctor/list`);
      if (data.success) {
         setLoading(false);
         setdoctors(data.doctors);
      } else {
         setLoading(true);
        toast.error(data.message);
      }
    } catch (error) {
       setLoading(true);
      toast.error(error.message);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendurl}/api/user/get-profile`, {
        headers: { token },
      });
      if (data.success) {
        const newaddress =
          typeof data.userdata.address === "string"
            ? JSON.parse(data.userdata.address)
            : data.userdata.address;

        // console.log(data.userdata);

        const newUserData = {
          ...data.userdata,
          address: newaddress,
        };
        setUserData(newUserData);
         setLoading(false);
      } else {
         setLoading(false);
        toast.error(data.message);
      }
    } catch (error) {
       setLoading(false);
      toast.error(error.message);
    }
  };

  const value = {
    doctors, getDoctorData,
    currencySymbol,
    token,
    setToken,
    backendurl,
    userData,
    setUserData,
    loadProfileData,
    doctorurl,
    loading,
    setLoading
  };



  useEffect(() => {
    getDoctorData();
  }, []);

  useEffect(() => {
    if (token) {
      loadProfileData();
    } else {
      setUserData(false);
    }
    
  }, [token]);





  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  );
};

export default Appcontextprovider;