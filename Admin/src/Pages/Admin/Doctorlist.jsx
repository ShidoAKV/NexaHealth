import React, { useContext, useEffect } from 'react';
import { AdminContext } from '../../Context/AdminContext.jsx';

const Doctorlist = () => {
  const { doctors, aToken, getalldoctors, changeAvailability } = useContext(AdminContext);

  // Fetch all doctors when the component mounts
  useEffect(() => {
    if (aToken) {
      getalldoctors();
    }
  }, [aToken]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen p-6 w-full">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center text-blue-800  mb-8">
        All Doctors
      </h1>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((item) => (
          <div
            key={item._id}
            className="bg-white shadow-lg rounded-lg flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Doctor Image Container */}
            <div className="w-full h-40 bg-primary flex justify-center items-center rounded-t-md">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
              />
            </div>

            {/* Doctor Info */}
            <div className="p-6 text-center">
              <p className="text-xl font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-600">{item.speciality}</p>
            </div>

            {/* Availability Info */}
            <div className="mt-2 mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.available}
                onChange={() => changeAvailability(item._id)}
                className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 rounded"
              />
              <p
                className={`text-sm font-medium ${
                  item.available ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.available ? 'Available' : 'Not Available'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctorlist;
