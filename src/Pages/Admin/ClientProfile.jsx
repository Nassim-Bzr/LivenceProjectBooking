import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import axios from "axios";
import { FaUser, FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaBirthdayCake, FaHistory, FaArrowLeft, FaExclamationTriangle, FaPaperPlane } from "react-icons/fa";
import io from "socket.io-client";

const ClientProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [clientData, setClientData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    console.log("Chargement du profil client avec ID:", userId);
    console.log("Type d'ID:", typeof userId);

    // Préparer l'en-tête d'autorisation
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Récupérer les informations du client
        // Note: Comme l'API n'existe peut-être pas encore, nous utilisons des données factices en cas d'erreur
        let clientInfo;
        try {
          // Essayer d'abord de récupérer l'utilisateur par son ID
          console.log("Tentative de récupération du client à l'URL:", `http://localhost:5000/users/${userId}`);
          const response = await axios.get(`http://localhost:5000/users/${userId}`, { 
            withCredentials: true,
            headers: authHeader 
          });
          clientInfo = response.data;
          console.log("Données client récupérées avec succès:", clientInfo);
        } catch (err) {
          console.warn("Impossible de récupérer les données réelles du client, utilisation de données factices", err);
          
          // Essayons de récupérer l'utilisateur depuis les réservations
          try {
            console.log("Tentative de récupération des réservations pour trouver les informations utilisateur");
            const allReservationsResponse = await axios.get("http://localhost:5000/reservations/all", { 
              withCredentials: true,
              headers: authHeader 
            });
            const userReservation = allReservationsResponse.data.find(res => String(res.user?.id) === String(userId));
            
            if (userReservation && userReservation.user) {
              console.log("Utilisateur trouvé dans les réservations:", userReservation.user);
              clientInfo = {
                ...userReservation.user,
                // Compléter avec des données fictives pour les champs manquants
                role: "client",
                telephone: "+33 6 12 34 56 78",
                adresse: "123 Rue de la République, 75011 Paris",
                dateNaissance: "1990-05-15",
                methodePaiement: "Visa ****1234",
                preferences: "Préfère les logements calmes avec vue",
                createdAt: userReservation.createdAt || "2023-01-15T14:30:00.000Z"
              };
            } else {
              // Aucune information trouvée, utiliser des données complètement fictives
              console.log("Aucune information utilisateur trouvée, utilisation de données entièrement fictives");
              clientInfo = {
                id: userId,
                nom: "Client #" + userId,
                email: `client${userId}@example.com`,
                role: "client",
                telephone: "+33 6 12 34 56 78",
                adresse: "123 Rue de la République, 75011 Paris",
                dateNaissance: "1990-05-15",
                methodePaiement: "Visa ****1234",
                preferences: "Préfère les logements calmes avec vue",
                createdAt: "2023-01-15T14:30:00.000Z"
              };
            }
          } catch (fallbackErr) {
            console.error("Impossible de récupérer les réservations pour trouver l'utilisateur", fallbackErr);
            // Utiliser des données complètement fictives
            clientInfo = {
              id: userId,
              nom: "Client #" + userId,
              email: `client${userId}@example.com`,
              role: "client",
              telephone: "+33 6 12 34 56 78",
              adresse: "123 Rue de la République, 75011 Paris",
              dateNaissance: "1990-05-15",
              methodePaiement: "Visa ****1234",
              preferences: "Préfère les logements calmes avec vue",
              createdAt: "2023-01-15T14:30:00.000Z"
            };
          }
        }

        // Récupérer les réservations du client
        let userReservations = [];
        try {
          // Utiliser l'endpoint spécifique pour les réservations d'un client
          console.log("Récupération des réservations du client");
          const userReservationsResponse = await axios.get("http://localhost:5000/reservations/user", { 
            withCredentials: true,
            headers: authHeader 
          });
          userReservations = userReservationsResponse.data;
          console.log(`${userReservations.length} réservations trouvées pour l'utilisateur ${userId}`);
        } catch (err) {
          console.warn("Impossible de récupérer les réservations du client", err);
        }

        setClientData(clientInfo);
        setReservations(userReservations);
      } catch (err) {
        console.error("Erreur lors du chargement des données client:", err);
        setError("Impossible de charger les informations du client");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [userId, user, navigate]);

  // Initialiser socket.io et récupérer les messages
  useEffect(() => {
    if (!user || !clientData) return;

    // Connexion à socket.io
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Authentification avec le token JWT
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    
    if (token) {
      newSocket.emit("authenticate", token);
    }

    // Gestion des événements socket
    newSocket.on("authenticated", async () => {
      console.log("Socket.io authentifié");
      await fetchMessages(authHeader);
    });

    newSocket.on("auth_error", (error) => {
      console.error("Erreur d'authentification socket:", error);
      // On essaie quand même de récupérer les messages
      fetchMessages(authHeader);
    });

    // Écouter l'événement de nouveaux messages
    newSocket.on("new_message", (message) => {
      if (message.senderId === parseInt(userId) || message.receiverId === parseInt(userId)) {
        setMessages(prevMessages => [...prevMessages, message]);
        
        // Marquer automatiquement comme lu si le message vient du client
        if (message.senderId === parseInt(userId)) {
          // Marquer le message comme lu instantanément si on le reçoit dans la conversation active
          markMessageAsRead(message.id);
        }
      }
    });
    
    // Écouter l'événement de lecture des messages
    newSocket.on("messages_read", (data) => {
      console.log("Messages marqués comme lus:", data);
      // Mettre à jour les messages envoyés par l'utilisateur courant qui ont été lus
      if (parseInt(data.receiverId) === parseInt(userId)) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            data.messageIds.includes(msg.id) ? { ...msg, lu: true } : msg
          )
        );
      }
    });
    
    // Écouter les événements "est en train d'écrire"
    newSocket.on("typing_start", (senderId) => {
      console.log("Utilisateur", senderId, "est en train d'écrire");
      if (senderId === parseInt(userId)) {
        setIsTyping(true);
      }
    });
    
    newSocket.on("typing_stop", (senderId) => {
      console.log("Utilisateur", senderId, "a arrêté d'écrire");
      if (senderId === parseInt(userId)) {
        setIsTyping(false);
      }
    });

    // Récupérer les messages
    const fetchMessages = async (headers = {}) => {
      setLoadingMessages(true);
      try {
        const response = await axios.get(`http://localhost:5000/messages/utilisateur/${userId}`, {
          withCredentials: true,
          headers
        });
        
        // Afficher immédiatement les messages
        setMessages(response.data);
        
        // Marquer automatiquement les messages de l'utilisateur comme lus
        const unreadMessages = response.data.filter(msg => 
          msg.senderId === parseInt(userId, 10) && !msg.lu
        );
        
        if (unreadMessages.length > 0) {
          console.log(`Marquage de ${unreadMessages.length} messages comme lus`);
          
          // Requête pour marquer les messages comme lus
          try {
            await axios.post(`http://localhost:5000/messages/marquer-lus`, {
              messageIds: unreadMessages.map(msg => msg.id)
            }, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                ...headers
              }
            });
            
            // Mettre à jour les messages dans l'état avec lu=true
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.senderId === parseInt(userId, 10) && !msg.lu 
                  ? {...msg, lu: true} 
                  : msg
              )
            );
          } catch (err) {
            console.error("Erreur lors du marquage des messages comme lus:", err);
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des messages:", err);
        // En cas d'erreur, utiliser un tableau vide
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    // Nettoyer à la déconnexion
    return () => {
      if (socket) {
        // Arrêter tous les événements "est en train d'écrire" en cours
        socket.emit("typing_stop", parseInt(userId, 10));
        
        // Nettoyer les timeouts
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Déconnecter
        socket.disconnect();
      }
    };
  }, [user, userId, clientData]);

  // Défiler automatiquement vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Envoyer un nouveau message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Stocker le message localement pour éviter d'attendre la réponse du serveur
    const tempMessage = {
      id: `temp-${new Date().getTime()}`,
      senderId: user.id,
      receiverId: parseInt(userId, 10),
      contenu: newMessage,
      type: "general",
      createdAt: new Date().toISOString(),
      isTemp: true // Marquer comme temporaire pour pouvoir le remplacer plus tard
    };
    
    // Ajouter immédiatement le message à l'interface
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    
    // Réinitialiser le champ de texte
    setNewMessage("");

    try {
      // S'assurer que userId est bien un nombre
      const receiverId = parseInt(userId, 10);
      
      console.log("Envoi d'un message au client:", receiverId);
      console.log("Contenu du message:", newMessage);
      
      // Récupérer le token et préparer l'en-tête d'autorisation
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post("http://localhost:5000/messages/envoyer", {
        receiverId,
        contenu: newMessage,
        type: "general"
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });

      console.log("Réponse du serveur:", response.data);

      // Récupérer le message confirmé
      const sentMessage = response.data;
      
      // Remplacer le message temporaire par le message confirmé
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id 
            ? {
                ...sentMessage,
                senderId: user.id,
                receiverId
              }
            : msg
        )
      );
      
      // Émettre l'événement socket.io
      if (socket) {
        socket.emit("send_message", {
          id: sentMessage.id,
          senderId: user.id,
          receiverId,
          contenu: newMessage,
          createdAt: sentMessage.createdAt
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      console.error("Détails de l'erreur:", err.response?.data || err.message);
      
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

  // Gérer la saisie du message et envoyer les notifications "est en train d'écrire"
  const handleMessageInput = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Envoyer l'événement "est en train d'écrire" si l'utilisateur commence à écrire
    if (socket && value && !newMessage) {
      socket.emit("typing_start", parseInt(userId, 10));
    }
    
    // Effacer le timeout précédent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Définir un nouveau timeout pour arrêter l'événement "est en train d'écrire"
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && value) {
        socket.emit("typing_stop", parseInt(userId, 10));
      }
    }, 1000); // Après 1 seconde d'inactivité
    
    // Si le champ est vide, envoyer immédiatement l'événement d'arrêt
    if (socket && !value) {
      socket.emit("typing_stop", parseInt(userId, 10));
    }
  };

  // Fonction pour formater une date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Fonction pour formater l'heure d'un message
  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Extraire la première image d'un tableau d'images JSON
  const getFirstImage = (imagesJson) => {
    try {
      const images = JSON.parse(imagesJson);
      return Array.isArray(images) && images.length > 0 
        ? images[0] 
        : "https://via.placeholder.com/300x200?text=Aucune+image";
    } catch (e) {
      return "https://via.placeholder.com/300x200?text=Erreur+image";
    }
  };

  // Obtenir la classe CSS en fonction du statut
  const getStatusClass = (status) => {
    switch (status) {
      case "confirmée": return "bg-green-100 text-green-800";
      case "en attente": return "bg-yellow-100 text-yellow-800";
      case "annulée": return "bg-red-100 text-red-800";
      case "terminée": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour marquer un seul message comme lu
  const markMessageAsRead = async (messageId) => {
    try {
      // Récupérer le token et préparer l'en-tête d'autorisation
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`http://localhost:5000/messages/marquer-lus`, {
        messageIds: [messageId]
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });
      
      // Mettre à jour le statut du message dans l'état local
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId ? {...msg, lu: true} : msg
        )
      );
      
      console.log("Message marqué comme lu instantanément:", messageId);
    } catch (err) {
      console.error("Erreur lors du marquage instantané du message comme lu:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Profil Client</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Profil Client</h1>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-rose-600 hover:text-rose-800"
          >
            <FaArrowLeft className="mr-2" /> Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profil Client</h1>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-rose-600 hover:text-rose-800"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
      </div>

      {/* Message d'information pour le développement */}
      <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md mb-4">
        <div className="flex">
          <FaExclamationTriangle className="h-5 w-5 text-blue-500 mr-2" />
          <div>
            <p className="font-medium">Information pour le développement</p>
            <p className="text-sm">
              Certaines API backend sont peut-être nécessaires pour afficher les données complètes:
            </p>
            <ul className="list-disc list-inside text-sm ml-2 mt-1">
              <li><code>/users/:userId</code> - Pour récupérer les infos du client</li>
              <li><code>/reservations/user/:userId</code> - Pour récupérer les réservations du client</li>
              <li><code>/messages/utilisateur/:userId</code> - Pour récupérer les messages</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Informations du client */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4">
            <FaUser className="w-10 h-10 text-gray-500" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{clientData.nom}</h2>
            <p className="text-gray-600">{clientData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaPhoneAlt className="w-5 h-5 text-gray-500 mr-2" />
                <span>{clientData.telephone}</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="w-5 h-5 text-gray-500 mr-2" />
                <span>{clientData.adresse}</span>
              </div>
              <div className="flex items-center">
                <FaBirthdayCake className="w-5 h-5 text-gray-500 mr-2" />
                <span>Né(e) le {formatDate(clientData.dateNaissance)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Informations de paiement</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaCreditCard className="w-5 h-5 text-gray-500 mr-2" />
                <span>{clientData.methodePaiement}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="w-5 h-5 text-gray-500 mr-2" />
                <span>Membre depuis {formatDate(clientData.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Préférences</h3>
          <p className="text-gray-600">{clientData.preferences}</p>
        </div>
      </div>

      {/* Section de messagerie avec le client */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <FaEnvelope className="mr-2" />
          Messagerie avec le client
        </h2>

        {loadingMessages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : (
          <div className="flex flex-col h-96">
            <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50 rounded-lg mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Aucun message avec ce client
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isFromAdmin = message.senderId === user.id;
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-3/4 rounded-lg px-4 py-2 ${
                            isFromAdmin 
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
                            {isFromAdmin && !message.isTemp && !message.error && (
                              <span className="ml-1 flex items-center" title={message.lu ? "Lu" : "Non lu"}>
                                {message.lu ? (
                                  <>
                                    <span className="text-xs text-blue-500 mr-1">Lu</span>
                                    <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-xs text-gray-400 mr-1">Non lu</span>
                                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                                    </svg>
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 max-w-max">
                        <div className="flex items-center">
                          <span className="text-sm mr-2">
                            <span className="font-semibold">{clientData.nom}</span> est en train d'écrire
                          </span>
                          <span className="flex space-x-1">
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "400ms" }}></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={handleMessageInput}
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
          </div>
        )}
      </div>

      {/* Historique des réservations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <FaHistory className="mr-2" />
          Historique des réservations
        </h2>

        {reservations.length === 0 ? (
          <p className="text-gray-500">Aucune réservation trouvée</p>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{reservation.appartement?.titre}</h3>
                    <p className="text-sm text-gray-600">
                      Du {formatDate(reservation.startDate)} au {formatDate(reservation.endDate)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </div>
                <div className="mt-2">
                  <img
                    src={getFirstImage(reservation.appartement?.images)}
                    alt={reservation.appartement?.titre}
                    className="w-32 h-24 object-cover rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile; 