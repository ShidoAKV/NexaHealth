import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { useState } from 'react';
import { AdminContext } from '../../Context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const AddDoctor = () => {
     
   const [docImg, setdocImg] = useState(false);
   const [name, setname] = useState('');
   const [email, setemail] = useState('');
   const [password, setpassword] = useState('');
   const [experience, setexperience] = useState('1');
   const [fees, setfees] = useState('');
   const [about, setabout] = useState('');
   const [speciality, setspeciality] = useState('General Physician')
   const [degree, setdegree] = useState('');
   const [address1, setaddress1] = useState('');
   const [address2, setaddress2] = useState('');
 
   const {backendurl,aToken}=useContext(AdminContext);

   const onsubmitHandler=async(e)=>{
    e.preventDefault();
      
       try {
          if(!docImg) {
            return toast.error('Upload Image');
          }

          const formdata=new FormData();
          
          formdata.append('image',docImg);
          formdata.append('email',email);
          formdata.append('password',password);
          formdata.append('name',name);
          formdata.append('experience',experience);
          formdata.append('fees',Number(fees));
          formdata.append('about',about);
          formdata.append('speciality',speciality);
          formdata.append('degree',degree);
          formdata.append('address',JSON.stringify({line1:address1,line2:address2}));
        
          // formdata.forEach((value,key)=>{
          //    console.log(value)
          // })
 
          const {data}=await axios.post(backendurl+'/api/admin/add-doctor',formdata,
            {headers:{aToken}}
          );
          // console.log(data);
           
          if(data.success==='true'){
            toast.success(data.message);
            setdocImg(false);
            setname('');
            setpassword('');
            setaddress1('');
            setaddress2('');
            setabout('');
            setemail('');
            setexperience('');
            setfees('');
            setspeciality('');

          }else{
            toast.error(data.message);
          }
          
       } catch (error) {
           toast.error(error.message);
       }
      
   }





  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-72 ">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6 sm:p-8 ">
        <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          Add Doctor
        </h1>
        <form onSubmit={onsubmitHandler} className="space-y-6">
          {/* Upload Picture Section */}
          <div className="flex flex-col items-center">
                <label
                  htmlFor="doc-img"
                  className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
                >
                  <img
                    src={docImg?URL.createObjectURL(docImg) : assets.upload_area}
                    alt="Upload Area"
                    className="w-full h-full rounded-full object-cover"
                  />
                </label>
                <input
                  onChange={(e) => setdocImg(e.target.files[0])}
                  type="file"
                  id="doc-img"
                  hidden
                />
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Upload Doctor Picture
                </p>
              </div>


          {/* Input Fields Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor Name
              </label>
              <input
                onChange={(e)=>setname(e.target.value)}
                value={name}
                type="text"
                placeholder="Name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor Email
              </label>
              <input
              onChange={(e)=>setemail(e.target.value)}
              value={email}
                type="email"
                placeholder="Email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor Password
              </label>
              <input
                onChange={(e)=>setpassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience
              </label>
              <select
                onChange={(e)=>setexperience(e.target.value)}
                value={experience}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              >
                {[...Array(10)].map((_, index) => (
                  <option key={index} value={`${index + 1} year`}>
                    {index + 1} year
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fees
              </label>
              <input
                onChange={(e)=>setfees(e.target.value)}
                value={fees}
                type="text"
                placeholder="Fees"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                speciality
              </label>
              <select
               onChange={(e)=>setspeciality(e.target.value)}
               value={speciality}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              >
                <option value="General Physician">General Physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <input
                onChange={(e)=>setdegree(e.target.value)}
                value={degree}
                type="text"
                placeholder="Education"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                 onChange={(e)=>setaddress1(e.target.value)}
                 value={address1}
                type="text"
                placeholder="Address 1"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 mb-2"
              />
              <input
                onChange={(e)=>setaddress2(e.target.value)}
                value={address2}
                type="text"
                placeholder="Address 2"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
          </div>

          {/* about Doctor Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              About Doctor
            </label>
            <textarea
              onChange={(e)=>setabout(e.target.value)}
              about={name}
              rows={3}
              placeholder="Write about doctor"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-200"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
