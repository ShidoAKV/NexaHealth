import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { DoctorContext } from '../../Context/DoctorContext';
import { AppContext } from '../../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorProfile = () => {
  const { dToken, getProfileData, ProfileData, setProfileData, backendurl } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: ProfileData.address,
        fees: ProfileData.fees,
        available: ProfileData.available,
      };

      const { data } = await axios.post(`${backendurl}/api/doctor/update-profile`, updateData, { headers: { dToken } });

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    ProfileData && (
      <div className='w-full max-w-4xl mx-auto my-8 p-6 bg-white border rounded shadow-md'>
        {/* Profile Image */}
        <div className='flex justify-center mb-6'>
          <img
            className='w-24 h-24 rounded-full object-cover border'
            src={ProfileData.image}
            alt="Doctor Profile"
          />
        </div>

        {/* Doctor Details */}
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>{ProfileData.name}</h1>
          <p className='text-gray-600'>{ProfileData.degree} - {ProfileData.speciality}</p>
          <p className='text-gray-500'>Experience: {ProfileData.experience} years</p>
        </div>

        {/* About Section */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-700'>About</h2>
         
            <p className='text-gray-600 mt-2'>{ProfileData.about}</p>
          
        </div>

        {/* Appointment Fees */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-700'>Appointment Fees</h2>
          {isEdit ? (
            <input
              type='number'
              className='border border-gray-300 rounded p-2'
              value={ProfileData.fees}
              onChange={(e) => handleInputChange('fees', e.target.value)}
            />
          ) : (
            <p className='text-gray-600 mt-2'>{currency}{ProfileData.fees}</p>
          )}
        </div>

        {/* Address */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-700'>Address</h2>
          {isEdit ? (
            <div>
              <input
                type='text'
                className='border border-gray-300 rounded p-2 w-full mb-2'
                value={ProfileData.address.line1}
                onChange={(e) => handleInputChange('address', { ...ProfileData.address, line1: e.target.value })}
                placeholder='Address Line 1'
              />
              <input
                type='text'
                className='border border-gray-300 rounded p-2 w-full'
                value={ProfileData.address.line2}
                onChange={(e) => handleInputChange('address', { ...ProfileData.address, line2: e.target.value })}
                placeholder='Address Line 2'
              />
            </div>
          ) : (
            <p className='text-gray-600 mt-2'>
              {ProfileData.address.line1}
              <br />
              {ProfileData.address.line2}
            </p>
          )}
        </div>

        {/* Availability Input */}
        <div className='mb-6 flex items-center'>
          {isEdit ? (
            <input
              type='checkbox'
              checked={ProfileData.available}
              onChange={(e) => handleInputChange('available', e.target.checked)}
              className='mr-2'
            />
          ) : (
            <span className='text-gray-600'>{ProfileData.available ? 'Available' : 'Not Available'}</span>
          )}
         {isEdit?<label className='text-gray-700 pl-2'>Available</label>:''}
        </div>

        {/* Edit/Save Button */}
        <div className='text-center'>
          {isEdit ? (
            <button
              onClick={() => updateProfile()}
              className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'>
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEdit(true)}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
