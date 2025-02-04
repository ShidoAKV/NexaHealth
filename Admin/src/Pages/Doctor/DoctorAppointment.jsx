import React, { useContext, useEffect } from 'react';
import { DoctorContext } from '../../Context/DoctorContext.jsx';
import { assets } from '../../assets/assets.js';
import { AppContext } from '../../Context/AppContext.jsx';

const DoctorAppointment = () => {
    
    const { dToken, getAppointments, appointments, completeAppointment, cancelAppointment } = useContext(DoctorContext);
    const { calculateAge, currency } = useContext(AppContext);

    useEffect(() => {
        if (dToken) {
            getAppointments();
        }
    }, [dToken, getAppointments]);

    return (
        <>
        <div className='w-full max-w-6xl mx-auto my-5'>
            <p className='mb-3 text-lg font-medium'>All Appointments</p>
            <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
                {/* Header Row */}
                <div className=' bg-blue-500 hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1fr] gap-4 p-4 border-b'>
                    <p className='text-white font-medium'>#</p>
                    <p className='text-white font-medium'>Patient</p>
                    <p className='text-white font-medium'>Payment</p>
                    <p className='text-white font-medium'>Age</p>
                    <p className='text-white font-medium'>Date & Time</p>
                    <p className='text-white font-medium'>Fees</p>
                    <p className='text-center text-white font-medium'>Action</p>
                </div>
                {/* Appointment Rows */}
                {appointments.reverse().map((item, index) => (
                    <div
                        key={index}
                        className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1fr] gap-4 p-4 border-b hover:bg-gray-100 transition duration-200'
                    >
                        <p className='max-sm:hidden'>{index + 1}</p>
                        <div className='flex items-center gap-2'>
                            <img
                                className='w-8 h-8 rounded-full object-cover'
                                src={item.userData.image}
                                alt="Patient Profile"
                            />
                            <p className='sm:hidden'>{item.userData.name}</p>
                        </div>
                        <p className='text-sm inline border border-primary  h-6 rounded-full w-14 text-center '>{item.payment ? 'Online' : 'CASH'}</p>
                        <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
                        <p>{item.slotDate}, {item.slotTime}</p>
                        <p>{currency}{item.amount}</p>
                        {
                            item.cancelled
                                ? <p className='text-red-600 font-medium text-sm'>Cancelled</p>
                                : item.isCompleted
                                    ? <p className='text-green-600 font-medium text-sm'>Completed</p>
                                    : <div className='flex md:flex-row items-center gap-2 pl-5  sm:flex-col'>
                                        <img
                                            onClick={() => completeAppointment(item._id)}
                                            className='w-10 h-10 cursor-pointer hover:scale-105 transition-transform'
                                            src={assets.tick_icon}
                                            alt="Confirm Appointment"
                                            title="Confirm Appointment"
                                        />
                                        <img
                                            onClick={() => cancelAppointment(item._id)}
                                            className='w-10 h-10 cursor-pointer hover:scale-105 rounded-full   transition-transform'
                                            src={assets.cancel_icon}
                                            alt="Cancel Appointment"
                                            title="Cancel Appointment"
                                        />
                                    </div>
                        }

                    </div>
                ))}
            </div>
        </div>

        </>

    );
};

export default DoctorAppointment;
