import React from 'react';
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
import Footer from './Components/Footer';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <Navbar/>
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
        <Route path='/appointment/:docid' element={<Apointment />} />
      </Routes>
      {/* <Footer/> */}
    </div>
  );
};

export default App;
