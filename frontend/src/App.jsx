// import React from 'react';
import { Routes,Route} from 'react-router-dom';
import Homes from './Pages/Homes';
import Doctor from './Pages/Doctor';
import Login from './Pages/Login';
import About from './Pages/About';
import Contact from './Pages/Contact';
import Myprofile from './Pages/Myprofile';
import Myappoinment from './Pages/Myappoinment';
import Apointment from './Pages/Apointment';
import Navbar from './Components/Navbar';
// import Footer from './Components/Footer';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatApp from './Pages/ChatApp';
import VideoApp from './Pages/VideoApp';
import Assistance from './Pages/Assistance';
import Prescription from './Pages/Prescription';
import GlobalLoader from './config/Loader';
import { useContext } from 'react';
import { Appcontext } from './Context/Context';
import Notification from './Pages/Notification';

const App = () => {
  const { loading } = useContext(Appcontext);
  return (
    <div className='mx-4 sm:mx-[10%]'>
        
      <ToastContainer/>
      <Navbar/>
       {loading && <GlobalLoader />}
      
      <Routes>
        <Route path='/' element={<Homes />}/>
        <Route path='/home' element={<Homes />} />
        <Route path='/doctors' element={<Doctor />} />
        <Route path='/doctors/:speciality' element={<Doctor />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/my-profile' element={<Myprofile />} />
        <Route path='/my-appointments' element={<Myappoinment />} />
        <Route path='/appointment/:docId' element={<Apointment />} />
        <Route path='/doctor-chat' element={<ChatApp />} />
        <Route path='/videocall' element={<VideoApp/>} />
        <Route path='/ai-assistance' element={<Assistance/>} />
        <Route path='/Notification' element={<Notification/>} />
        <Route path='/my-prescription' element={<Prescription/>} />
      </Routes>
      {/* <Footer/> */}

      
    </div>
    
  );
};

export default App;
