import { useContext } from 'react'
import Login from './Pages/Login.jsx'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './Context/AdminContext.jsx';
import Navbar from './Component/Navbar.jsx';
import Sidebar from './Component/Sidebar.jsx';
import { Routes,Route } from 'react-router-dom';
import Dashboad from './Pages/Admin/Dashboad.jsx';
import AllAppointment from './Pages/Admin/AllAppointment.jsx';
import Doctorlist from './Pages/Admin/Doctorlist.jsx';
import AddDoctor from './Pages/Admin/AddDoctor.jsx';
import { DoctorContext } from './Context/DoctorContext.jsx';
import DoctorDashboard from './Pages/Doctor/DoctorDashboard.jsx';
import DoctorAppointment from './Pages/Doctor/DoctorAppointment.jsx';
import DoctorProfile from './Pages/Doctor/DoctorProfile.jsx';
import DoctorChat from './Pages/Doctor/DoctorChat.jsx';
import Videocall from './Pages/Doctor/Videocall.jsx';
import DoctorMedicalForm from './Pages/Doctor/DoctorMedicalForm.jsx';

const App = () => {

const {aToken}=useContext(AdminContext);
const {dToken}=useContext(DoctorContext);

  return (aToken||dToken)?(
    <div className='bg-[#F8F9FD]'>
      <ToastContainer/>
      <Navbar/>
      <div className=' flex items-start'>
      <Sidebar/>
      <Routes>
         {/* Admin Routes */}
         {aToken && (
            <>
              <Route path='/admin-dashboard' element={<Dashboad />} />
              <Route path='/all-appointments' element={<AllAppointment />} />
              <Route path='/add-doctors' element={<AddDoctor />} />
              <Route path='/doctor-list' element={<Doctorlist />} />
            </>
          )}

          {/* Doctor Routes */}
          {dToken && (
            <>
              <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appointments' element={<DoctorAppointment />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
              <Route path='/doctor-chat' element={<DoctorChat/>} />
              <Route path='/doctor-videocall' element={<Videocall/>} />
              <Route path='/doctor-generate-form' element={<DoctorMedicalForm/>} />
            </>
          )}
      </Routes>
      </div>
    </div>
  ):
  (
    <>
     <Login/>
     <ToastContainer/>
    </>
  )
}

export default App;