import { Routes, Route } from 'react-router-dom';
import Home from './routes/home/Home';
import BaseLayout from './routes/layouts/BaseLayout';
import Login from './routes/login/Login';
import AboutUs from './routes/about-us/AboutUs';
import './index.css';
import HotelDetails from './routes/hotel-details/HotelDetails';
import Register from './routes/register/Register';
import ForgotPassword from './routes/forgot-password/ForgotPassword';
import UserProfile from './routes/user-profile/UserProfile';
import HotelsSearch from './routes/listings/HotelsSearch';
function App() {
  return (
    <Routes>
      <Route path="/" element={<BaseLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="hotels" element={<HotelsSearch />} />
        <Route path="hotel/:hotelId" element={<HotelDetails/>} />
        <Route path="register" element={<Register/>} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="user-profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}

export default App;
