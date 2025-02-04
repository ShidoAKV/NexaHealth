import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate=useNavigate();
  return (
    <div className="md:mx-10 bg-gray-900 text-white py-10 px-5 md:px-10 rounded-md">
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* ------- Left Section ------- */}
        <div>
          <img className="h-10 rounded-md mb-4" src={assets.logo} alt="NexaHealth Logo" />
          <p className="text-sm text-gray-200">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
            standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
            a type specimen book.
          </p>
        </div>
        
        {/* ------- Center Section ------- */}
        <div>
          <p className="font-semibold text-lg mb-3">COMPANY</p>
          <ul className="space-y-2 text-gray-400">
            <li onClick={()=>{navigate('./home',scrollTo(0,0))}}className="hover:text-white cursor-pointer">Home</li>
            <li onClick={()=>{navigate('./about',scrollTo(0,0))}} className="hover:text-white cursor-pointer">About Us</li>
            <li onClick={()=>{navigate('./contact',scrollTo(0,0))}} className="hover:text-white cursor-pointer">Contact Us</li>
            <li onClick={()=>{navigate('./Privacy',scrollTo(0,0))}} className="hover:text-white cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
        
        {/* ------- Right Section ------- */}
        <div>
          <p className="font-semibold text-lg mb-3">GET IN TOUCH</p>
          <ul className="space-y-2 text-gray-200 ">
            <li className="hover:text-white cursor-pointer">+1-212-456-7890</li>
            <li className="hover:text-white cursor-pointer">Nexahealth@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* ------- Copyright Text ------- */}
      <div className="text-center mt-8 text-gray-500 text-sm border-t border-gray-700 pt-4">
        Copyright © 2024 Nexahealth - All Rights Reserved.
      </div>
    </div>
  );
};

export default Footer;
