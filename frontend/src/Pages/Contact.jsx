import React from 'react';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>CONTACT <span className="text-gray-700 font-semibold">US</span></p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 my-8 md:my-16 text-sm">
        <img
          className="rounded-xl w-full max-w-xs md:max-w-md shadow-lg "
          src={assets.contact_image}
          alt="Contact"
        />

        <div className="flex flex-col items-center md:items-start gap-4 md:gap-6 text-center md:text-left px-4 md:px-0">
          <div>
            <p className="font-semibold text-lg text-gray-600">Our OFFICE</p>
            <p className="text-gray-500 mt-2">54709 Willms Station Suite 350, Washington, USA</p>
          </div>

          <div>
            <p className="text-gray-500 mt-2">Tel: (415) 555‑0132</p>
          </div>

          <div>
            <p className="text-gray-500 mt-2">Email: abhi3vish@gmail.com</p>
          </div>

          <div className="mt-6">
            <p className="font-semibold text-lg text-gray-600">Careers at PRESCRIPTO</p>
            <p className="text-gray-500 mt-2">Learn more about our teams and job openings.</p>
          </div>

          <button className="text-gray-800 border border-black px-8 py-3 mt-4 text-sm hover:bg-gray-800 hover:text-white transition duration-300">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
