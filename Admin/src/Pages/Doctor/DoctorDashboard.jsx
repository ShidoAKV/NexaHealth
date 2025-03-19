import { useContext } from 'react'
import { DoctorContext } from '../../Context/DoctorContext.jsx'
import { useEffect } from 'react';
import { assets } from '../../assets/assets.js';
import { AppContext } from '../../Context/AppContext.jsx';

const DoctorDashboard = () => {

    const { dToken, dashData, getDashData,completeAppointment,cancelAppointment } = useContext(DoctorContext);
    const { currency } = useContext(AppContext);
    
    useEffect(() => {
        if (dToken) {
            getDashData();
        }
    }, [dToken,getDashData])

    return dashData && (
        <div className='m-5'>
            <div className='flex flex-wrap gap-3 '>
                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100  cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.earning_icon} alt="DoctrIcon" />
                    <div>
                        <p className='text-2xl font-semibold text-gray-600'>{currency}{dashData.earnings}</p>
                        <p className=' text-gray-400'>Earnings</p>
                    </div>

                </div>


                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100  cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-8' src={assets.appointment_icon} alt="DoctrIcon" />
                    <div>
                        <p className='text-2xl font-semibold text-gray-600'> {dashData.appointments}</p>
                        <p className=' text-gray-400'>Appointments</p>
                    </div>

                </div>


                <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100  cursor-pointer hover:scale-105 transition-all'>
                    <img className='w-14' src={assets.patients_icon} alt="DoctrIcon" />
                    <div>
                        <p className='text-2xl font-semibold text-gray-600'>{dashData.patients}</p>
                        <p className=' text-gray-400'>Patients</p>
                    </div>
                </div>

            </div>


            {<div className='bg-white'>
                <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
                    <img src={assets.list_icon} alt="" />
                    <p className='font-semibold'>Latest Booking</p>
                </div>
                <div className='pt-4 border border-t-0'>
                    {
                        dashData.latestAppointments.map((item, index) => (
                            <div className='flex items-center px-6 py-3 gap-20 hover:bg-gray-100 ' key={index}>
                                <img className='rounded-md w-20  ' src={item.userData.image} alt="" />
                                <div className='flex-1 text-sm'>
                                    <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                                    <p className='text-gray-600'>{item.slotDate}</p>
                                </div>
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
                        ))

                    }
                </div>
            </div>}




        </div>
    )
}

export default DoctorDashboard