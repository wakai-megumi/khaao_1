import  React from 'react'  
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import UserLogin from '../pages/auth/UserLogin.jsx'
import UserRegister from '../pages/auth/UserRegister.jsx'
import PartnerLogin from '../pages/auth/PartnerLogin.jsx'
import PartnerRegister from '../pages/auth/PartnerRegister.jsx'
import HomePage from '../pages/general/HomePage.jsx'
import CreateFood from '../pages/foodPartner/CreateFood.jsx'
import Profile from '../pages/foodPartner/Profile'
import SavedFood from '../pages/general/SavedFood.jsx'
const  AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} /> 
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/foodpartner/register" element={<PartnerRegister />} />
                <Route path="/foodpartner/login" element={<PartnerLogin />} />
  <Route path="/create_food" element={<CreateFood />} />
  <Route path="/foodpartner/:id" element={<Profile />} />
  <Route path ="/saved" element = {<SavedFood />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes
