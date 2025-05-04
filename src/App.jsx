import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
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
import io from 'socket.io-client';
import { SOCKET_URL } from './config/api';

// Composant interne qui utilise useAuth pour les notifications
const AppWithNotifications = () => {
  const { user, incrementUnreadMessageCount } = useAuth();
  const [socket, setSocket] = useState(null);
  const [showGlobalNotification, setShowGlobalNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ sender: '', content: '' });
  
  // Connecter à Socket.io
  useEffect(() => {
    if (user) {
      // Initialiser socket.io
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
  
      // Authentifier avec le token JWT
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        newSocket.emit("authenticate", token);
      }
  
      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);
  
  // Gérer les notifications
  useEffect(() => {
    if (!socket || !user) return;
  
    // Fonction de gestion des nouveaux messages
    const handleNewMessage = (message) => {
      // Si le message est pour l'utilisateur courant
      if (message.receiverId === user.id) {
        // Incrémenter le compteur de messages non lus
        incrementUnreadMessageCount(1);
  
        // Si l'utilisateur n'est pas sur la page de messagerie, montrer une notification
        if (!window.location.pathname.includes('/messagerie')) {
          // Afficher une notification globale
          const sender = message.senderName || "Nouveau message";
          setNotificationData({
            sender,
            content: message.contenu.length > 30 ? message.contenu.substring(0, 30) + '...' : message.contenu,
            senderId: message.senderId
          });
          setShowGlobalNotification(true);
  
          // Jouer un son de notification
          const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=notification-sound-7062.mp3');
          audio.play().catch(e => console.log("Erreur lecture audio:", e));
  
          // Cacher la notification après quelques secondes
          setTimeout(() => {
            setShowGlobalNotification(false);
          }, 5000);
        }
      }
    };
  
    // S'abonner à l'événement new_message
    socket.on("new_message", handleNewMessage);
  
    // Nettoyer l'abonnement
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, user, incrementUnreadMessageCount]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/appartement/:slug" element={<AppartementDetails />} />
        <Route path="/appartement/:slug/avis" element={<AvisAppartement />} />
        <Route path="/appartement/:slug/checkout" element={<CheckoutReservation />} />
        <Route path="/reservation/:id" element={<ReservationDetails />} />
        
        {/* Routes d'administration */}
        <Route path="/admin/add-appartement" element={<AddAppartement />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {/* Notification globale pour les nouveaux messages */}
      {showGlobalNotification && (
        <div 
          className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50 border-l-4 border-rose-500 cursor-pointer animate-slideIn"
          onClick={() => {
            setShowGlobalNotification(false);
            window.location.href = `/messagerie?contact=${notificationData.senderId}`;
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notificationData.sender}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notificationData.content}
              </p>
              <p className="mt-1 text-xs text-rose-500">
                Cliquez pour voir le message
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Empêcher le clic de se propager
                  setShowGlobalNotification(false);
                }}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <div className='bg-[#f7f7f7]'>
      <AuthProvider>
        <BrowserRouter>
          <SmoobuCallbackHandler />
          <Navbar />
          <GlobalNotifications />
          <AppWithNotifications />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ message: "Veuillez vous connecter pour accéder à cette page." }} />;
  }
  
  return children;
};

// Composant pour protéger les routes admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ message: "Veuillez vous connecter pour accéder à cette page." }} />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" replace state={{ message: "Vous n'avez pas les droits pour accéder à cette page." }} />;
  }
  
  return children;
};

export default App; 