import React from 'react'
import { useContext } from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Appcontext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setstate] = useState('SignUp');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [name, setname] = useState('');
  const navigate = useNavigate();
  const { backendurl, token, setToken, doctorurl } = useContext(Appcontext);

  const onsubmitHandler = async (e) => {
    e.preventDefault();
    try {

      if (state === 'SignUp') {
        // Signup route
        const { data } = await axios.post(backendurl + '/api/user/register', { email, password, name });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success('Successfully Created')
        } else {
          toast.error(data.message);
        }
      }
      else {
        // Login route

        const { data } = await axios.post(backendurl + '/api/user/login', { email, password });

        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          toast.success('login successfully')
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
    setemail('guestemail@gmail.com')
    setstate('Login')
  }


  useEffect(() => {
    if (token) navigate('/');
  }, [token])

  return (

    <form onSubmit={onsubmitHandler} className='min-h-[80vh] flex items-center '>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl  text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state == 'SignUp' ? "Create Account" : "Login"}</p>
        <div className="flex justify-between items-center">
          <p>
            Please {state === 'SignUp' ? "Sign Up" : "Log In"} to book appointment
          </p>
        {state==='Login'&&<button
            type="button"
            onClick={handleguest}
            className="px-4 py-1 bg-primary text-white rounded-lg"
          >
            Test
          </button>}
        </div>

        {
          state === 'SignUp' &&
          <div className='w-full'>
            <p>
              Full name
            </p>
            <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e) => setname(e.target.value)} value={name} />
          </div>
        }

        <div className='w-full'>
          <p>
            Email
          </p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e) => setemail(e.target.value)} value={email} />
        </div>

        <div className='w-full'>
          <p>
            Password
          </p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e) => setpassword(e.target.value)} value={password} />
        </div>


        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base '>
          {state == 'SignUp' ? "Create Account" : "Login"}
        </button>
        {state == 'SignUp' ? <p>Already have an account<span onClick={() => setstate('Login')} className='text-primary underline cursor-pointer' >Login here</span ></p> : <p>Create an new account?<span onClick={() => setstate('SignUp')} className='text-primary underline cursor-pointer'>click here</span></p>}
        <a className='text-primary underline cursor-pointer' href={`${doctorurl}`}>Are You Doctor?</a>


      </div>

    </form>

  )
}

export default Login