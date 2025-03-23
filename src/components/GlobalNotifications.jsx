import { useState, useEffect } from 'react';
import { useMessages } from '../Context/MessageContext';
import { useAuth } from '../Context/AuthContext';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const GlobalNotifications = () => {
  const { user } = useAuth();
  const { hasNewMessages } = useMessages();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Effet pour afficher la notification
  useEffect(() => {
    if (hasNewMessages) {
      setNotificationMessage('Vous avez reçu un nouveau message !');
      setShowNotification(true);
      
      // Masquer la notification après 3 secondes
      const timeout = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [hasNewMessages]);

  // Ne rien rendre si l'utilisateur n'est pas connecté
  if (!user) return null;

  return (
    <>
      {showNotification && (
        <div className="fixed top-4 right-4 bg-rose-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center">
            <FaBell className="mr-2" />
            <span>{notificationMessage}</span>
          </div>
          <Link 
            to="/messages" 
            className="block text-xs text-rose-100 hover:text-white mt-1 underline"
          >
            Voir les messages
          </Link>
        </div>
      )}
    </>
  );
};

export default GlobalNotifications; 