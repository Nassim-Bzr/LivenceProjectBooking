import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useMessages } from "../Context/MessageContext";
import { useAuth } from "../Context/AuthContext";
import { FaEnvelope, FaComment } from "react-icons/fa";

const MessagePreview = () => {
  const { user } = useAuth();
  const { conversations } = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Calculer le nombre de messages non lus
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      const count = conversations.reduce((total, conv) => {
        return total + (conv.unreadCount || 0);
      }, 0);
      setUnreadCount(count);
    }
  }, [conversations]);

  // Fermer le dropdown lorsqu'on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extraire le nom du destinataire
  const getRecipientName = (conversation) => {
    if (!conversation || !user) return "Admin";
    const otherParticipant = conversation.participants.find(p => p.id !== user.id);
    
    // Si c'est l'admin (ID 1) ou si isAdmin est true, retourner "Admin"
    if (otherParticipant && (otherParticipant.id === 1 || otherParticipant.isAdmin)) {
      return "Admin";
    }
    
    return otherParticipant?.nom || "Admin";
  };

  // Tronquer le contenu du message pour l'aperçu
  const truncateMessage = (content, maxLength = 30) => {
    if (!content) return "";
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative flex items-center justify-center text-gray-700 hover:text-rose-500 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaEnvelope size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 overflow-hidden border">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-medium">Messages</h3>
            <Link 
              to="/messages" 
              className="text-xs text-rose-500 hover:text-rose-700"
              onClick={() => setIsOpen(false)}
            >
              Voir tous
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {conversations && conversations.length > 0 ? (
              conversations.slice(0, 5).map(conversation => (
                <Link 
                  key={conversation.id}
                  to="/messages"
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 hover:bg-gray-50 border-b ${conversation.unreadCount ? 'bg-rose-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaComment className="text-gray-500" />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{getRecipientName(conversation)}</p>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-500 text-white text-xs">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {truncateMessage(conversation.lastMessageContent)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>Aucun message</p>
              </div>
            )}
          </div>

          <Link 
            to="/messages" 
            className="block text-center p-3 text-rose-500 hover:text-rose-700 border-t"
            onClick={() => setIsOpen(false)}
          >
            Ouvrir la messagerie
          </Link>
        </div>
      )}
    </div>
  );
};

export default MessagePreview; 