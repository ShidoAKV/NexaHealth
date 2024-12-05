import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Appcontext } from '../Context/Context';
import { assets } from '../assets/assets';
import Relateddoctor from '../Components/Relateddoctor';

const Appointment = () => {
  const { docid } = useParams();
  const { doctors, currencySymbol } = useContext(Appcontext);
  const daysofweek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const [docinfo, setdocinfo] = useState(null);
  const [docSlots, setdocSlots] = useState([]);
  const [slotIndex, setslotIndex] = useState(0);
  const [slotTime, setslotTime] = useState('');

  const fetchDocinfo = () => {
    const docInfo = doctors.find(doc => doc._id === docid);
    setdocinfo(docInfo);
  };

  const getavailableslot=() => {
    const slots = [];  // Local array to hold all time slots
    let today = new Date();
  
    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
  
      let endtime = new Date(currentDate);
      endtime.setHours(21, 0, 0, 0);
  
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }
  
      let timeslots = [];
      while (currentDate < endtime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeslots.push({
          datetime: new Date(currentDate),
          time: formattedTime
        });
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      slots.push(timeslots);
    }
  
    setdocSlots(slots);  // Set the state once with the complete slots array
  };
  

  useEffect(() => {
    fetchDocinfo();
  }, [doctors, docid]);

  useEffect(() => {
    if (docinfo) getavailableslot();
  }, [docinfo]);

  return docinfo && (
    <div>
      {/* -------Doctor details---------- */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:max-w-72 rounded-lg' src={docinfo?.image} alt={docinfo?.name || "Doctor's Image"} />
        </div>

        <div className='flex-1 border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900 '>
            {docinfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>

          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docinfo.degree} - {docinfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docinfo.experience}</button>
          </div>

          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docinfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>Appointment fee: <span className='text-gray-600'>{currencySymbol}{docinfo.fees}</span></p>
        </div>
      </div>

      {/* --------BOOKING SLOT---------- */}
      <div className='sm:ml-2 sm:pl-4 mt-4 font-medium text-gray-500'>
        <p>Booking slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && docSlots.map((item, index) => (
            <div
              onClick={() => setslotIndex(index)}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white' : 'border border-gray-200'}`}
              key={index}
            >
              <p>{item[0] && daysofweek[item[0].datetime.getDay()]}</p>
              <p>{item[0] && item[0].datetime.getDate()}</p>
            </div>
          ))}
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {docSlots.length > 0 && docSlots[slotIndex]?.map((item, index) => (
            <p
              onClick={() => setslotTime(item.time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`}
              key={index}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
        </div>
        <button className='bg-primary text-white text-sm  font-light px-14 py-3 rounded-full my-6'>Book an appointment</button>
      </div>

      {/* -------listing related document--------- */}
      <Relateddoctor docid={docid} speciality={docinfo.speciality}/>
    </div>
  );
};

export default Appointment;
