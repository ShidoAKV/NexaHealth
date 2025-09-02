import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { Appcontext } from '../Context/Context.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const {token,setToken,userData}=useContext(Appcontext)
  
  
  const logout=()=>{
    setToken(false) ;  
    localStorage.removeItem('token');
  }
  return (
    <nav className="w-full bg-white shadow-md ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer">
            <img
              onClick={() => navigate('/home')}
              className="h-10 rounded-md"
              src='logo.png'
              alt="logo"
            />
          </div>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex flex-grow justify-center space-x-8">
            <NavLink
              to="/"
              exact
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold'
                  : 'hover:text-primary transition-colors'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold'
                  : 'hover:text-primary transition-colors'
              }
            >
              All Doctors
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold'
                  : 'hover:text-primary transition-colors'
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? 'text-primary font-semibold'
                  : 'hover:text-primary transition-colors'
              }
            >
              Contact
            </NavLink>

          </div>

          {/* User Menu or Login Button */}
          <div className="flex items-center gap-4">
            {token&&userData ? (
              <div className="relative group">
                <div className="flex items-center gap-2 cursor-pointer">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={userData.image}
                    alt="profile"
                  />
                  <img
                    className="w-2.5"
                    src={assets.dropdown_icon}
                    alt="dropdown icon"
                  />
                </div>
                <div className="absolute  right-0 hidden group-hover:block bg-white shadow-md rounded-md py-1 z-20">
                  <p
                    onClick={() => navigate('/my-profile')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate('/my-appointments')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    My Appointments
                  </p>

                  <p
                    onClick={() => navigate('/my-prescription')}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    My Prescriptions
                  </p>

                  <p
                    onClick={logout}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-primary font-medium border border-primary px-4 py-1 rounded-md hover:bg-primary hover:text-white transition"
              >
                Create Account
              </button>
            )}

            <img
              onClick={() => setShowMenu(true)}
              className="w-6 cursor-pointer md:hidden"
              src={assets.menu_icon}
              alt="menu icon"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-white z-20 md:hidden">
          <div className="flex items-center justify-between p-4 border-b">
          <img className="h-8" src='logo.png' alt="logo" />
            <img
              onClick={() => setShowMenu(false)}
              className="w-10 h-8 cursor-pointer"
              src={assets.cross_icon}
              alt="close menu"
            />
          </div>
          <ul className="flex flex-col items-center gap-4 mt-4">
            {/* isActive class was a inbuild class Of navlink */}
            <NavLink
              to="/"
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'px-4 py-2 rounded bg-primary text-white'
                  : 'px-4 py-2 rounded hover:text-primary'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/doctors"
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'px-4 py-2 rounded bg-primary text-white'
                  : 'px-4 py-2 rounded hover:text-primary'
              }
            >
              All Doctors
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'px-4 py-2 rounded bg-primary text-white'
                  : 'px-4 py-2 rounded hover:text-primary'
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? 'px-4 py-2 rounded bg-primary text-white'
                  : 'px-4 py-2 rounded hover:text-primary'
              }
            >
              Contact
            </NavLink>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
