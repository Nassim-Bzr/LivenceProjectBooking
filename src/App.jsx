import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import Navbar from './components/Navbar';
import GlobalNotifications from './Components/GlobalNotifications';
import SmoobuCallbackHandler from './Components/SmoobuCallbackHandler';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Profile from './Pages/Profile';
import AppartementDetails from './Pages/AppartementDetails';
import AvisAppartement from './Pages/AvisAppartement';
import CheckoutReservation from './Pages/CheckoutReservation';
import ReservationDetails from './Pages/ReservationDetails';
import AddAppartement from './Pages/Admin/AddAppartement';
import AdminReservations from './Pages/Admin/Reservations';

function App() {
  // Log pour vérifier que l'app se charge correctement
  console.log("App component initialized");

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Assurer que SmoobuCallbackHandler est initialisé avant d'autres composants */}
        <SmoobuCallbackHandler />
        <Navbar />
        <GlobalNotifications />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/appartement/:slug" element={<AppartementDetails />} />
          <Route path="/appartement/:slug/avis" element={<AvisAppartement />} />
          <Route path="/appartement/:slug/checkout" element={<CheckoutReservation />} />
          <Route path="/reservation/:id" element={<ReservationDetails />} />
          
          {/* Routes d'administration */}
          <Route path="/admin/add-appartement" element={<AddAppartement />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App; 