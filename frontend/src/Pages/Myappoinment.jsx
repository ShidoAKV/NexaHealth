import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import { Appcontext } from '../Context/Context';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import aiAssistantAnimation from '../assets/Animation.json';

const AppointmentCard = lazy(() =>import('./AppointmentCard')); 

const MyAppointment = () => {
  const navigate = useNavigate();
  const { backendurl, token, getDoctorData ,setLoading } = useContext(Appcontext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(backendurl + '/api/user/appointments', { headers: { token } });
      if (data.success){
         setAppointments(data.appointments.reverse());
         setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        backendurl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        setLoading(false);
      } else {
        toast.error(data.message);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendurl + '/api/user/verifyRazorpay',
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserAppointments();
            navigate('/my-appointments');
          }
        } catch (error) {
          toast.error(error.message);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        backendurl + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        setLoading(false);
        initPay(data.order);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
      getDoctorData();
    }
  }, [token]);

  return (
    <div className="flex">
      <div className="max-w-2xl mx-auto p-4">
        <p className="bg-blue-500 pb-3 pl-3 pt-1 mt-8 font-semibold text-lg text-white rounded-sm border-2 border-blue-600">
          My Appointments
        </p>

        <div className="mt-4">
          <Suspense fallback={<p>.</p>}>
            {appointments?.map((items, index) => (
              <AppointmentCard
                key={index}
                items={items}
                cancelAppointment={cancelAppointment}
                appointmentRazorpay={appointmentRazorpay}
              />
            ))}
          </Suspense>
        </div>
      </div>

      {/* Chat & AI Assistant */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/doctor-chat')}
          className="fixed bottom-10 right-10 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
        >
          💬
        </button>

        <div
          onClick={() => navigate('/ai-assistance')}
          className="fixed w-16 bottom-32 right-12"
        >
          <Lottie
            className="w-20 cursor-pointer"
            animationData={aiAssistantAnimation}
            loop={true}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(MyAppointment);
