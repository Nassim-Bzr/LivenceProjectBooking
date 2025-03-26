import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import { FaUser, FaComments, FaPaperPlane, FaBuilding, FaLifeRing, FaArrowLeft } from "react-icons/fa";
import io from "socket.io-client";

const Messagerie = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState("general");
  const [appartements, setAppartements] = useState([]);
  const [selectedAppartement, setSelectedAppartement] = useState(null);
  const messagesEndRef = useRef(null);

  // Rediriger si non connecté
  useEffect(() => {
    if (!user) {
      console.log("Utilisateur non connecté, redirection vers login");
      navigate("/login");
      return;
    }

    console.log("Utilisateur connecté:", user);

    // Initialiser socket.io
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Préparer l'en-tête d'autorisation pour les requêtes
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    
    // Charger les appartements (pour les messages concernant un appartement spécifique)
    const fetchAppartements = async () => {
      try {
        console.log("Chargement des appartements...");
        const response = await axios.get("http://localhost:5000/api/appartements", {
          withCredentials: true,
          headers: authHeader
        });
        setAppartements(response.data);
        console.log("Appartements chargés:", response.data.length);
      } catch (err) {
        console.error("Erreur lors du chargement des appartements:", err);
      }
    };

    fetchAppartements();

    // Authentifier avec le token JWT
    console.log("Token trouvé:", !!token);
    
    if (token) {
      newSocket.emit("authenticate", token);
    }

    // Écouter les nouveaux messages
    newSocket.on("authenticated", () => {
      console.log("Socket.io authentifié avec succès");
      fetchContacts(authHeader);
    });

    newSocket.on("auth_error", (error) => {
      console.error("Erreur d'authentification socket:", error);
      // On essaie quand même de charger les contacts
      fetchContacts(authHeader);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Erreur de connexion socket:", error);
      // On essaie quand même de charger les contacts
      fetchContacts(authHeader);
    });

    // Nettoyer à la déconnexion
    return () => {
      console.log("Nettoyage des ressources socket");
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, navigate]);

  // Configurer l'écoute des nouveaux messages lorsque selectedContact change
  useEffect(() => {
    if (!socket || !user || !selectedContact) return;

    // Fonction de gestion des nouveaux messages
    const handleNewMessage = (message) => {
      console.log("Nouveau message reçu via socket:", message);
      
      const isRelevantMessage = (
        (message.senderId === user.id && message.receiverId === parseInt(selectedContact.id, 10)) ||
        (message.receiverId === user.id && message.senderId === parseInt(selectedContact.id, 10))
      );
      
      if (isRelevantMessage) {
        console.log("Message ajouté à la conversation courante");
        setMessages(prevMessages => [...prevMessages, message]);
      } else {
        console.log("Message ignoré car il ne concerne pas la conversation courante");
      }
    };

    // S'abonner à l'événement
    socket.on("new_message", handleNewMessage);
    
    // Nettoyer l'abonnement quand le contact change ou le composant est démonté
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, selectedContact, user]);

  // Défiler vers le bas lors de l'ajout de nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Si l'utilisateur sélectionne un contact, charger les messages
  useEffect(() => {
    if (selectedContact) {
      console.log("Contact sélectionné, chargement des messages:", selectedContact.id);
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact]);

  // Récupérer les contacts (conversations existantes)
  const fetchContacts = async (authHeader = {}) => {
    console.log("Chargement des contacts...");
    
    // Si authHeader n'est pas fourni, le récupérer ici
    if (Object.keys(authHeader).length === 0) {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (token) {
        authHeader = { Authorization: `Bearer ${token}` };
      }
    }
    
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/messages/conversations", {
        withCredentials: true,
        headers: authHeader
      });
      
      console.log("Contacts récupérés:", response.data);
      
      // Si aucune conversation avec un admin n'existe, créer une option de support par défaut
      let hasAdmin = response.data.some(contact => contact.role === "admin");
      
      let contactsList = [...response.data];
      
      if (!hasAdmin) {
        // Ajouter un contact de support
        const supportContact = {
          id: "support",
          nom: "Support Livence",
          role: "admin",
          isDefault: true
        };
        contactsList.unshift(supportContact);
      }
      
      setContacts(contactsList);
      
      // Sélectionner le premier contact par défaut
      if (contactsList.length > 0 && !selectedContact) {
        console.log("Sélection du premier contact:", contactsList[0]);
        setSelectedContact(contactsList[0]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des contacts:", err);
      // Créer un contact admin par défaut en cas d'erreur
      const defaultSupport = {
        id: "support",
        nom: "Support Livence",
        role: "admin",
        isDefault: true
      };
      setContacts([defaultSupport]);
      
      if (!selectedContact) {
        console.log("Sélection du contact de support par défaut");
        setSelectedContact(defaultSupport);
      }
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les messages avec un contact spécifique
  const fetchMessages = async (contactId) => {
    console.log("Récupération des messages avec", contactId);
    
    // Si c'est le support par défaut et qu'il n'y a pas encore de contact admin réel
    if (contactId === "support") {
      console.log("Contact support par défaut, aucun message à afficher");
      setMessages([]);
      return;
    }

    // Préparer l'en-tête d'autorisation
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await axios.get(`http://localhost:5000/messages/utilisateur/${contactId}`, {
        withCredentials: true,
        headers: authHeader
      });
      console.log("Messages récupérés:", response.data.length);
      setMessages(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des messages:", err);
      console.error("Détails:", err.response?.data || err.message);
      setMessages([]);
    }
  };

  // Envoyer un nouveau message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    
    console.log("Tentative d'envoi de message à", selectedContact.id);

    // Si c'est le support par défaut, chercher un admin
    let receiverId = selectedContact.id;
    if (receiverId === "support") {
      // Dans un vrai système, on pourrait avoir une API pour trouver un admin disponible
      // Ici, on utilise un ID d'admin par défaut (à ajuster selon votre base de données)
      receiverId = 1; // ID de l'admin par défaut
      console.log("Contact support, utilisation de l'ID admin par défaut:", receiverId);
    }

    // Préparer l'en-tête d'autorisation
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    // Stocker le message localement pour éviter d'attendre la réponse du serveur
    const tempMessage = {
      id: `temp-${new Date().getTime()}`,
      senderId: user.id,
      receiverId: parseInt(receiverId, 10),
      contenu: newMessage,
      type: messageType,
      appartementId: messageType === "appartement" ? parseInt(selectedAppartement, 10) : null,
      createdAt: new Date().toISOString(),
      isTemp: true // Marquer comme temporaire pour pouvoir le remplacer plus tard
    };
    
    // Ajouter immédiatement le message à l'interface
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    
    // Réinitialiser le champ de texte
    setNewMessage("");
    
    try {
      const messageData = {
        receiverId: parseInt(receiverId, 10),
        contenu: newMessage,
        type: messageType
      };

      // Ajouter l'ID d'appartement si nécessaire
      if (messageType === "appartement" && selectedAppartement) {
        messageData.appartementId = parseInt(selectedAppartement, 10);
      }

      console.log("Données du message à envoyer:", messageData);
      
      const response = await axios.post("http://localhost:5000/messages/envoyer", messageData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });

      console.log("Message envoyé avec succès:", response.data);
      
      // Récupérer le message confirmé
      const sentMessage = response.data;
      
      // Remplacer le message temporaire par le message confirmé
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...sentMessage,
                senderId: user.id,
                receiverId: parseInt(receiverId, 10),
                contenu: newMessage
              }
            : msg
        )
      );
      
      // Si c'est le premier message avec le support, créer une vraie conversation
      if (selectedContact.isDefault && selectedContact.id === "support") {
        console.log("Premier message au support, création d'une vraie conversation");
        
        // Trouver l'ID réel du destinataire admin depuis la réponse
        const realAdminId = response.data.receiverId;
        
        // Créer un nouveau contact réel (non-default)
        const newRealContact = {
          id: realAdminId,
          nom: "Support Livence",
          role: "admin",
          isDefault: false
        };
        
        // Remplacer le contact temporaire par le contact réel
        setContacts(prevContacts => 
          prevContacts.map(c => c.id === "support" ? newRealContact : c)
        );
        
        // Sélectionner le nouveau contact
        setSelectedContact(newRealContact);
      }

      // Notifier via socket.io
      if (socket) {
        console.log("Notification socket pour le message envoyé");
        socket.emit("send_message", {
          id: sentMessage.id,
          senderId: user.id,
          receiverId: parseInt(receiverId, 10),
          contenu: newMessage,
          type: messageType,
          appartementId: messageType === "appartement" ? parseInt(selectedAppartement, 10) : null,
          createdAt: sentMessage.createdAt
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      console.error("Détails:", err.response?.data || err.message);
      
      // En cas d'erreur, marquer le message temporaire comme erreur
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, error: true, isTemp: false }
            : msg
        )
      );
      
      alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
    }
  };

  // Créer une nouvelle conversation de support
  const startSupportConversation = () => {
    const supportContact = {
      id: "support",
      nom: "Support Livence",
      role: "admin",
      isDefault: true
    };
    
    // Vérifier si ce contact existe déjà
    if (!contacts.find(c => c.id === "support")) {
      setContacts(prevContacts => [supportContact, ...prevContacts]);
    }
    
    setSelectedContact(supportContact);
    setMessages([]);
    setMessageType("support");
  };

  // Formater l'heure des messages
  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !selectedContact) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Messagerie</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messagerie</h1>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-rose-600 hover:text-rose-800"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4">
          {/* Sidebar des contacts */}
          <div className="md:col-span-1 border-r">
            <div className="p-4 border-b">
              <button 
                onClick={startSupportConversation} 
                className="w-full bg-rose-600 text-white py-2 px-4 rounded hover:bg-rose-700 transition flex items-center justify-center"
              >
                <FaLifeRing className="mr-2" />
                Contacter le support
              </button>
            </div>
            <div className="overflow-y-auto h-96">
              {contacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Aucune conversation
                </div>
              ) : (
                <ul>
                  {contacts.map((contact) => (
                    <li 
                      key={contact.id} 
                      className={`border-b cursor-pointer hover:bg-gray-50 ${
                        selectedContact?.id === contact.id ? 'bg-rose-50' : ''
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <FaUser className="text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{contact.nom}</div>
                          <div className="text-sm text-gray-500">
                            {contact.role === "admin" ? "Support" : "Client"}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="md:col-span-3 flex flex-col h-[600px]">
            {selectedContact ? (
              <>
                {/* En-tête de la conversation */}
                <div className="border-b p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <FaUser className="text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{selectedContact.nom}</div>
                    <div className="text-sm text-gray-500">
                      {selectedContact.role === "admin" ? "Support" : "Client"}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      {selectedContact.isDefault 
                        ? "Démarrez la conversation en envoyant un message" 
                        : "Aucun message dans cette conversation"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isFromCurrentUser = message.senderId === user.id;
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-3/4 rounded-lg px-4 py-2 ${
                                isFromCurrentUser 
                                  ? message.error 
                                    ? 'bg-red-100 text-red-800 border border-red-300' 
                                    : message.isTemp 
                                      ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                      : 'bg-rose-100 text-rose-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <div className="text-sm relative">
                                {message.contenu}
                                {message.isTemp && (
                                  <div className="absolute -bottom-4 right-0 text-xs text-rose-500">
                                    Envoi en cours...
                                  </div>
                                )}
                                {message.error && (
                                  <div className="absolute -bottom-4 right-0 text-xs text-red-500">
                                    Échec de l'envoi
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-right mt-1 flex items-center justify-end">
                                {formatMessageTime(message.createdAt)}
                                {message.isTemp && (
                                  <svg className="ml-1 animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                )}
                                {message.error && (
                                  <svg className="ml-1 h-3 w-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Options de message */}
                <div className="p-3 border-t bg-gray-50">
                  <div className="flex mb-2">
                    <button
                      className={`px-3 py-1 rounded-md mr-2 ${
                        messageType === "general" 
                          ? "bg-rose-600 text-white" 
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => setMessageType("general")}
                    >
                      <FaComments className="inline mr-1" /> Général
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md mr-2 ${
                        messageType === "support" 
                          ? "bg-rose-600 text-white" 
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => setMessageType("support")}
                    >
                      <FaLifeRing className="inline mr-1" /> Support
                    </button>
                    <button
                      className={`px-3 py-1 rounded-md ${
                        messageType === "appartement" 
                          ? "bg-rose-600 text-white" 
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      onClick={() => setMessageType("appartement")}
                    >
                      <FaBuilding className="inline mr-1" /> Appartement
                    </button>
                  </div>

                  {messageType === "appartement" && (
                    <div className="mb-2">
                      <select
                        className="w-full p-2 border rounded"
                        value={selectedAppartement || ""}
                        onChange={(e) => setSelectedAppartement(e.target.value)}
                      >
                        <option value="">Sélectionner un appartement</option>
                        {appartements.map((appartement) => (
                          <option key={appartement.id} value={appartement.id}>
                            {appartement.titre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Formulaire d'envoi */}
                <form onSubmit={handleSendMessage} className="p-4 border-t flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="bg-rose-600 text-white px-4 py-2 rounded-r-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Sélectionnez un contact ou démarrez une nouvelle conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messagerie; 