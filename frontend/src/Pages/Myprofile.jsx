import React, { useState } from 'react';
import { assets } from '../assets/assets';

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: 'Abhishek',
    image: assets.profile_pic,
    email: 'abhi33vish@gmail.com',
    phone: '+91 43897291284',
    address: {
      line1: 'California',
      line2: 'New Jersey',
    },
    gender: 'Male',
    dob: '2004-11-04', // format date to match input date format
  });

  const [isEdit, setIsEdit] = useState(true);

  return (
    <div className="w-full max-w-xs mx-auto mt-6 flex flex-col gap-3 p-3 text-xs bg-white shadow-md rounded-md md:max-w-sm">
      <div className="flex justify-center">
        <img className="w-36 rounded-full mt-4" src={userData.image} alt="Profile" />
      </div>
      <div className="text-center">
        {isEdit ? (
          <input
            className="bg-gray-50 text-3xl font-semibold text-center w-full mt-4 p-2 rounded"
            type="text"
            onChange={(e) =>
              setUserData((prev) => ({ ...prev, name: e.target.value }))
            }
            value={userData.name}
          />
        ) : (
          <p className="font-semibold text-3xl text-neutral-800 mt-4">{userData.name}</p>
        )}
      </div>

      <hr className="bg-zinc-400 h-[1px] border-none" />

      <div>
        <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-600">
          <p>Email id:</p>
          <p>{userData.email}</p>
          <p>Phone:</p>
          {isEdit ? (
            <input
              type="text"
              className="p-1 border rounded"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
              value={userData.phone}
            />
          ) : (
            <p>{userData.phone}</p>
          )}
          <p>Address:</p>
          {isEdit ? (
            <div>
              <input
                type="text"
                className="p-1 border rounded mb-1 w-full"
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
                value={userData.address.line1}
                placeholder="Line 1"
              />
              <input
                type="text"
                className="p-1 border rounded w-full"
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
                value={userData.address.line2}
                placeholder="Line 2"
              />
            </div>
          ) : (
            <p>
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-neutral-500 underline">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-600">
          <p>Gender:</p>
          {isEdit ? (
            <select
              className="p-1 border rounded"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, gender: e.target.value }))
              }
              value={userData.gender}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p>{userData.gender}</p>
          )}
          <p>Birthday:</p>
          {isEdit ? (
            <input
              type="date"
              className="p-1 border rounded"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, dob: e.target.value }))
              }
              value={userData.dob}
            />
          ) : (
            <p>{userData.dob}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
          onClick={() => setIsEdit(!isEdit)}
        >
          {isEdit ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;
