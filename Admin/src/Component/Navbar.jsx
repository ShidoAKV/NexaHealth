import { useContext } from 'react';
// import { assets } from '../../../frontend/src/assets/assets.js';
import { AdminContext } from '../Context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../Context/DoctorContext.jsx';

const Navbar = () => {
    const navigate=useNavigate();

    const { aToken,setaToken } = useContext(AdminContext);
    const {dToken,setDToken}=useContext(DoctorContext);



   
    const handleLogout = () => {
        navigate('/')
        aToken&&setaToken('')
        aToken&&localStorage.removeItem('aToken')

        dToken&&setDToken('')
        dToken&&localStorage.removeItem('dToken')
    };

    return (
        <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white shadow-sm">
            <img
                src='logo.png'
                alt=""
                className="h-8 w-auto sm:h-10 rounded-sm"
            />
            <p className="text-lg font-medium text-gray-700">
                {aToken ? 'Admin' : 'Doctor'}
            </p>
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
            >
                Logout
            </button>
        </div>
    );
};

export default Navbar;
