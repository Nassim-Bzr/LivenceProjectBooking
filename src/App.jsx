import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { MessageProvider } from './Context/MessageContext';
import Navbar from './components/Navbar';
import GlobalNotifications from './Components/GlobalNotifications';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Profile from './Pages/Profile';
import Messages from './Pages/Messages';
import AppartementDetails from './Pages/AppartementDetails';
import AvisAppartement from './Pages/AvisAppartement';
import CheckoutReservation from './Pages/CheckoutReservation';
import AddAppartement from './Pages/Admin/AddAppartement';

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <BrowserRouter>
          <Navbar />
          <GlobalNotifications />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/appartement/:slug" element={<AppartementDetails />} />
            <Route path="/appartement/:slug/avis" element={<AvisAppartement />} />
            <Route path="/appartement/:slug/checkout" element={<CheckoutReservation />} />
            
            {/* Routes d'administration */}
            <Route path="/admin/add-appartement" element={<AddAppartement />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </MessageProvider>
    </AuthProvider>
  );
}

export default App; 