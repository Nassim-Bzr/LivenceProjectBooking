import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Messagerie = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [socket, setSocket] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);

  // Si l'utilisateur sélectionne un contact, charger les messages
  useEffect(() => {
    if (selectedContact) {
      console.log("Contact sélectionné, chargement des messages:", selectedContact.id);
      fetchMessages(selectedContact.id);
      
      // Réinitialiser le compteur de messages non lus pour ce contact lors de la sélection
      setUnreadMessages(prev => ({
        ...prev,
        [selectedContact.id]: 0
      }));
    }
  }, [selectedContact]);

  // Gérer le paramètre URL pour sélectionner automatiquement un contact depuis une notification
  useEffect(() => {
    // Récupérer le paramètre contactId de l'URL
    const params = new URLSearchParams(location.search);
    const contactId = params.get('contact');
    
    // Si un contactId est spécifié et que les contacts sont déjà chargés
    if (contactId && contacts.length > 0) {
      // Trouver le contact correspondant
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setSelectedContact(contact);
        console.log('Contact sélectionné depuis URL:', contact);
        
        // Nettoyer l'URL
        navigate('/messagerie', { replace: true });
      }
    }
  }, [contacts, location.search, navigate]);

  // Récupérer les contacts (conversations existantes)
  const fetchContacts = async (authHeader = {}) => {
    // ... existing code ...
  };

  return (
    // ... existing JSX ...
  );
};

export default Messagerie; 