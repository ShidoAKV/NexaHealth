import React, { useContext } from 'react';
import { Appcontext } from '../Context/Context';

const MyAppointment = () => {
  const { doctors } = useContext(Appcontext);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <p className="pb-3 mt-8 font-semibold text-lg text-gray-800 border-b border-gray-300">
        My Appointments
      </p>

      <div className="mt-4">
        {doctors.slice(0, 2).map((items, index) => (
          <div
            className="flex flex-col sm:flex-row items-start gap-4 p-4 border-b border-gray-200"
            key={index}
          >
            <div className="flex-shrink-0">
              <img
                className="w-28 h-36 rounded-full object-cover"
                src={items.image}
                alt="Doctor"
              />
            </div>

            <div className="flex-grow">
              <p className="text-base font-medium text-gray-900">{items.name}</p>
              <p className="text-sm text-gray-600">{items.speciality}</p>
              <p className="text-sm text-gray-500 mt-1">
                Address: {items.address.line1}, {items.address.line2}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-semibold text-gray-700">Date & Time:</span> 13 Nov 2024 | 1:30 PM
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
              <button className="px-4 py-2 bg-blue-500 text-white rounded font-medium text-sm hover:bg-blue-600 transition">
                Pay Online
              </button>
              <div></div>
              <button style={{width:"63%"}} className=" flex px-4 py-2 bg-red-500 text-white rounded font-medium text-sm hover:bg-red-600 transition">
                <p className='pr-20 pl-2'>Cancel</p>
               
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointment;
