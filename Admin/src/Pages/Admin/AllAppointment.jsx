import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../Context/AdminContext.jsx';
import { AppContext } from '../../Context/AppContext.jsx';
import { assets } from '../../assets/assets.js';

const AllAppointment = () => {
    const { aToken, appointments, getAllappointments,cancelAppointment } = useContext(AdminContext);
    const { calculateAge, currency } = useContext(AppContext);

    useEffect(() => {
        if (aToken) {
            getAllappointments();
        }
    }, [aToken, getAllappointments]);

    return (
        <div className='w-full max-w-6xl mx-auto my-5'>
            <p className='mb-3 text-lg font-medium'>All Appointments</p>
            <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
                {/* Header Row */}
                <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b'>
                    <p>#</p>
                    <p>Patient</p>
                    <p>Age</p>
                    <p>Date & Time</p>
                    <p>Doctor</p>
                    <p>Fees</p>
                    <p>Actions</p>
                </div>

                {/* Appointment List */}
                {appointments.map((item, index) => (
                    <div
                        className='flex flex-wrap justify-between gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b items-center'
                        key={item.id || index}
                    >
                        {/* Index */}
                        <p className='max-sm:hidden'>{index + 1}</p>

                        {/* Patient Info */}
                        <div className='flex items-center gap-2'>
                            <img
                                className='w-8 h-8 rounded-full object-cover'
                                src={item.userData.image}
                                alt="Patient Profile"
                            />
                            <p>{item.userData.name}</p>
                        </div>

                        {/* Age */}
                        <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>

                        {/* Date & Time */}
                        <p>{item.slotDate}, {item.slotTime}</p>

                        {/* Doctor Info */}
                        <div className='flex items-center gap-2'>
                            <img
                                className='w-8 h-8 rounded-full bg-gray-200 object-cover'
                                src={item.docData.image}
                                alt="Doctor Profile"
                            />
                            <p>{item.docData.name}</p>
                        </div>

                        {/* Fees */}
                        <p>{currency}{item.amount}</p>

                        {/* Actions */}
                        {item.cancelled ? (
                            <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                        ) : (
                            <img
                              onClick={()=>cancelAppointment(item._id)}
                                className='w-10 cursor-pointer'
                                src={assets.cancel_icon}
                                alt="Cancel Icon"
                                title="Cancel Appointment"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllAppointment;
