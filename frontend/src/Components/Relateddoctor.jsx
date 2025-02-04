import React, { useContext, useState, useEffect } from 'react';
import { Appcontext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';

const Relateddoctor = ({ docId, speciality }) => {
  const { doctors } = useContext(Appcontext);
  const [relDoc, setrelDoc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0 && speciality) {
      const doctorsdata = doctors.filter(
        (doc) => doc.speciality === speciality && doc._id !== docId
      );
      setrelDoc(doctorsdata);
    }
  }, [doctors, speciality, docId]);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {relDoc.slice(0, 5).map((item, index) => (
          <div
            onClick={() => {
              navigate(`/appointment/${item._id}`);
              window.scrollTo(0, 0);
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-transform duration-500"
            key={index}
          >
            <img
              className="w-full h-40 object-cover"
              src={item.image}
              style={{ backgroundColor: 'rgb(95 111 255)' }}
              alt="Doctor"
            />
            <div className="p-4">
             <div className={`flex items-center gap-1 text-sm ${item.available?'text-green-500':'text-red-500'} mb-2`}>
                <span className={`h-2 w-2 ${item.available?'bg-green-500':'bg-red-500'} rounded-full`}></span>
               {item.available? <p>Available</p>:<p>Unavailable</p>}
              </div>
              <p className="text-gray-900 text-lg">{item.name}</p>
              <p className="text-gray-500 text-sm">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate('/doctors');
          window.scrollTo(0, 0);
        }}
        className="mt-10 px-12 py-3 bg-blue-500 text-gray-900 rounded-lg hover:bg-blue-600 transition-colors hover:text-gray-300"
      >
        More
      </button>
    </div>
  );
};

export default Relateddoctor;
