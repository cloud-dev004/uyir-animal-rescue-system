import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import UyirCitizen from './pages/uyir_citizen';
import UyirVolunteer from './pages/uyir_volunteer';
import VolunteerRegister from './pages/VolunteerRegister';
import VolunteerLogin from './pages/VolunteerLogin';
import UyirAdmin from './pages/uyir_admin';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import UyirVet from './pages/uyir_vet';
import './App.css';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/Home" element={<Home/>} />
          <Route path="/uyir_citizen" element={<UyirCitizen />} />
          <Route path="/uyir_volunteer" element={<UyirVolunteer />} />
          <Route path="/VolunteerRegister" element={<VolunteerRegister />} />
          <Route path="/VolunteerLogin" element={<VolunteerLogin />} />
          <Route path="/uyir_admin" element={<UyirAdmin />} />
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route path="/AdminRegister" element={<AdminRegister />} />
          <Route path="/uyir_vet" element={<UyirVet />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App;
