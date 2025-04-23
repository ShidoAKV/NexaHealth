import React, { useContext, useEffect, useState } from 'react';
import { Appcontext } from '../Context/Context';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import aiAssistantAnimation from '../assets/Animation.json';

// import { BiMessageAltAdd } from "react-icons/bi";
const MyAppointment = () => {
  const navigate = useNavigate();
  const { backendurl, token, getDoctorData } = useContext(Appcontext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendurl + '/api/user/appointments', { headers: { token } });

      if (data.success) {
        setAppointments(data.appointments.reverse());
        // console.log(data.appointments);

      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);

    }
  }


  const cancelAppointment = async (appointmentId) => {

    try {

      const { data } = await axios.post(backendurl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } });

      if (data.success) {
        toast.success(data.message);
        window.location.reload();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }

  }


  const initPay = (order) => {
    //     RAZORPAY_KEY_ID="rzp_test_nxSF77arxy9gvB"

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response, 'response hai bhai')
        try {

          const { data } = await axios.post(backendurl + '/api/user/verifyRazorpay', response, { headers: { token } })
          console.log(data, 'verfifyRazorpay')

          if (data.success) {
            getUserAppointments();
            navigate('/my-appointments')
          }

        } catch (error) {
          console.log(error);
          toast.error(error.message);

        }

      }
    }



    const rzp = new window.Razorpay(options);
    rzp.open();

  };

  const appointmentRazorpay = async (appointmentId) => {

    try {
      const { data } = await axios.post(backendurl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } });

      if (data.success) {
        // console.log(data);

        console.log(data.order);

        initPay(data.order);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }

  }

  useEffect(() => {
    if (token) {
      getUserAppointments();
      getDoctorData();
    }
  }, [token])






  return (
    <div className='flex'>
      <div className="max-w-2xl mx-auto p-4">
        <p className="bg-blue-500 pb-3 pl-3 pt-1 mt-8 font-semibold text-lg text-white rounded-sm border-2 border-blue-600">
          My Appointments
        </p>
        <div className="mt-4">
          {appointments.map((items, index) => (
            <div
              className="flex flex-col sm:flex-row items-start gap-4 p-4 border-b border-gray-200"
              key={index}
            >
              <div className="flex-shrink-0">
                <img
                  className="w-28 h-36 rounded-md object-cover border-l border-r border-t border-b hover:shadow-2xl hover: shadow-blue-500"
                  src={items.docData.image}
                  alt="Doctor"
                />
              </div>

              <div className="flex-grow">
                <p className="text-base font-medium text-gray-900">{items.docData.name}</p>
                <p className="text-sm text-gray-600">{items.docData.speciality}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Address: {items.docData.address.line1}, {items.docData.address.line2}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-semibold text-gray-700">Date & Time:</span>{items.slotDate} | {items.slotTime}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                {!items.cancelled && items.payment && !items.isCompleted && (
                  <button className="ml-2 pr-12 px-4 py-2 shadow-sm shadow-white bg-green-500 text-black rounded font-medium text-sm hover:bg-green-600 hover:text-white transition">
                    <p className="pl-5">Paid</p>
                  </button>
                )}

                {!items.cancelled && !items.payment && !items.isCompleted && (
                  <button
                    onClick={() => appointmentRazorpay(items._id)}
                    className="px-10 py-2 shadow-sm shadow-blue-500 bg-white text-black rounded font-medium text-sm hover:bg-blue-600 hover:text-white transition"
                  >
                    <div className="flex gap-1">
                      <div>Pay</div>
                      <div>Online</div>
                    </div>
                  </button>
                )}
                <div></div>
                {!items.cancelled && !items.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(items._id)}
                    style={{ width: '100%' }}
                    className="pr-6 pl-6 py-2 shadow-sm shadow-red-500 bg-white text-black rounded font-medium text-sm hover:bg-red-600 hover:text-white transition"
                  >
                    Cancel
                  </button>
                )}

                {items.cancelled && !items.isCompleted && (
                  <button
                    style={{ width: '100%' }}
                    className="flex pl-6 pr-6 py-2 shadow-sm shadow-red-500 bg-white text-black rounded font-medium text-sm hover:bg-red-600 hover:text-white transition"
                  >
                    Appointment Cancelled
                  </button>
                )}

                {items.isCompleted && (
                  <button className="flex pl-6 pr-6 py-2 shadow-sm shadow-green-500 bg-white text-black rounded font-medium text-sm hover:bg-green-600 hover:text-white transition">
                    Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

     <div className='flex justify-end h'>
     <button
        onClick={() => navigate('/doctor-chat')}
        className="fixed bottom-8 right-8 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
        style={{
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
      <span>💬</span>
       </button>

       <div
        onClick={() => navigate('/ai-assistance')}
        className="fixed  w-16  bottom-32 rounded-md right-5 p-3  text-white"
        style={{
          fontSize: '40px',
        }}
      >
       
         <Lottie
        className="w-20  justify-self-end cursor-pointer"
        animationData={aiAssistantAnimation}
        loop={true} />
       </div>
     </div>
    

    </div>
  );
};

export default React.memo(MyAppointment);