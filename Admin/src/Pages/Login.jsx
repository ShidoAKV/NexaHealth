import React from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { AdminContext } from '../Context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DoctorContext } from '../Context/DoctorContext';

const Login = () => {
  const [state, setState] = useState('Admin');
  const { setaToken, backendurl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');


  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Admin') {
        // admin login
        const { data } = await axios.post(backendurl + '/api/admin/login', {
          email,
          password,
        });


        // console.log(data);

        if (data.success === 'true') {
          localStorage.setItem('aToken', data.token);
          setaToken(data.token);
          toast.success('Admin login successfully')
        } else {
          toast.error(data.message);
        }
      }
      else if (state === 'Doctor') {

        const { data } = await axios.post(backendurl + '/api/doctor/login', { email, password });
        // console.log(data);
        if (data.success === true) {
          // console.log(data.token);
          localStorage.setItem('dToken', data.token);
          setDToken(data.token);
          toast.success('Doctor login successfully')
        } else {
          toast.error(data.message);
        }

      }
    } catch (error) {
      toast.error(error.message);
    }


  }

   const handleguest = () => {
    setpassword('12345678')
    setemail('guestdoctoremail@gmail.com')
    setState('Doctor')
  }


  return (

    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <form onSubmit={onSubmitHandler} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6 text-center flex justify-center items-centers gap-10">
          <p className="text-xl font-semibold text-gray-700">
            <span className="text-primary">{state}</span> Login
          </p>
          {state === 'Admin' && (
            <p className="text-sm text-gray-700 mt-2">
               Don't crash my application !! <strong className='text-primary font-semibold underline cursor-pointer'>admin@nexahealth.com</strong >|<strong className='text-primary font-semibold underline cursor-pointer'>123456</strong> 
            </p>
          )}
         {
          (state==='Doctor' )&&  <button
            type="button"
            onClick={handleguest}
            className="px-4 py-1 bg-primary text-white rounded-lg"
          >
            Test
          </button>
         }

        </div>


        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            onChange={(e) => setemail(e.target.value)}
            value={email}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            onChange={(e) => setpassword(e.target.value)}
            value={password}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-primary text-white rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Login
        </button>
        {
          (state === 'Admin')
            ? <p>Doctor login? <span className='text-primary font-semibold underline cursor-pointer' onClick={() => setState('Doctor')}>click here</span></p>
            : <p>Admin login?<span className='text-primary  font-semibold underline  cursor-pointer' onClick={() => setState('Admin')}>click here</span></p>

        }

      </form>
    </div>

  );
};


export default Login;
