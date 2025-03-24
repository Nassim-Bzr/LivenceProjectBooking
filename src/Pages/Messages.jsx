import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useMessages } from "../Context/MessageContext";
import { FaUser, FaPaperPlane, FaEllipsisV, FaInbox, FaSync, FaTrash, FaExclamationTriangle, FaExternalLinkAlt, FaVolumeUp, FaVolumeMute, FaBell, FaSearch } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    conversations, 
    messages, 
    activeConversation, 
    loading,
    loadConversations, 
    loadMessages, 
    sendMessage, 
    startConversationWithAdmin,
    setActiveConversation,
    refreshData,
    deleteConversation,
    startConversationWithUser,
    hasNewMessages,
    testNotificationSound,
    setMessages,
    clearConversationMessages,
    clearAllConversations,
    setLoading,
    setError,
    setConversations,
    markConversationAsRead
  } = useMessages();
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [syncStatus, setSyncStatus] = useState("active"); // active, updating, idle
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Récupérer la préférence de l'utilisateur depuis le localStorage
    const saved = localStorage.getItem('message_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true; // Activé par défaut
  });
  const [showNotification, setShowNotification] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState([]);
  const prevMessagesLengthRef = useRef(0);
  const [showClearMessagesConfirm, setShowClearMessagesConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteMessagesConfirm, setShowDeleteMessagesConfirm] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedConversationForMenu, setSelectedConversationForMenu] = useState(null);
  const messagesContainerRef = useRef(null);

  // Fonction sécurisée pour défiler vers le bas
  const scrollToBottom = useCallback((smooth = true) => {
    try {
      if (containerRef.current) {
        // Option 1: Utiliser scrollTop pour défiler
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      } else if (messagesEndRef.current) {
        // Option 2: Utiliser scrollIntoView si disponible
        messagesEndRef.current.scrollIntoView({ 
          behavior: smooth ? "smooth" : "auto", 
          block: "end" 
        });
      }
    } catch (error) {
      console.warn("Erreur lors du défilement:", error);
    }
  }, []);

  // Défilement automatique lorsque les messages changent - avec protection
  useEffect(() => {
    // Si aucun message ou pas de changement significatif, ne rien faire
    if (!messages || messages.length === 0 || messages.length === prevMessagesLengthRef.current) return;
    
    // Mettre à jour la référence du nombre de messages
    prevMessagesLengthRef.current = messages.length;
    
    // Vérifier si nous sommes déjà en bas avant de défiler
    const isAtBottom = containerRef.current && 
      (containerRef.current.scrollHeight - containerRef.current.scrollTop <= containerRef.current.clientHeight + 100);
    
    if (isAtBottom) {
      const scrollToBottomOnce = () => {
        try {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        } catch (error) {
          // Gérer l'erreur silencieusement
        }
      };

      // Exécuter une seule fois avec un délai minimal
      const timeoutId = setTimeout(scrollToBottomOnce, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]); // N'écoute que les changements de messages

  // Charger les conversations au démarrage - Éviter les rechargements multiples
  useEffect(() => {
    if (!user || initialLoadDone) return;
    setInitialLoadDone(true);
    loadConversations().catch(() => {
      setError("Erreur lors du chargement des conversations");
    });
  }, [user, loadConversations, initialLoadDone]);

  // Modifier la gestion de la conversation active - Simplifiée pour éviter les boucles
  useEffect(() => {
    if (!user || !conversations.length || activeConversation) return;
    const firstConversation = conversations[0];
    setActiveConversation(firstConversation);
    loadMessages(firstConversation.id);
    
    if (window.innerWidth < 768) {
      setShowMobileConversations(false);
    }
  }, [user, conversations, activeConversation, loadMessages]);

  // Gérer le paramètre userId dans l'URL
  useEffect(() => {
    if (!user || user.role !== 'admin' || !conversations.length) return;
    
    const searchParams = new URLSearchParams(location.search);
    const targetUserId = searchParams.get('userId');
    
    if (targetUserId) {
      const existingConversation = conversations.find(
        conv => conv.participants.some(
          p => p.id !== user.id && String(p.id) === String(targetUserId)
        )
      );
      
      if (existingConversation) {
        loadMessages(existingConversation.id);
        if (window.innerWidth < 768) {
          setShowMobileConversations(false);
        }
      } else {
        startConversationWithUser(targetUserId);
      }
      
      navigate('/messages', { replace: true });
    }
  }, [user, conversations, location.search, navigate, loadMessages, startConversationWithUser]);

  // Filtrer les conversations en fonction du terme de recherche
  const filteredConversations = conversations.filter(
    conv => {
      const otherParticipant = conv.participants.find(p => p.id !== user?.id);
      return otherParticipant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             otherParticipant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  // Effet pour gérer les changements de messages
  useEffect(() => {
    if (messages.length > 0 && activeConversation) {
      // Mettre à jour la conversation active avec le dernier message
      const lastMessage = messages[messages.length - 1];
      setActiveConversation(prev => ({
        ...prev,
        lastMessageContent: lastMessage.content,
        lastMessageAt: lastMessage.createdAt
      }));

      // Marquer la conversation comme lue
      markConversationAsRead(activeConversation.id);
    }
  }, [messages, activeConversation, markConversationAsRead]);

  // Effet pour gérer les changements de conversation active
  useEffect(() => {
    if (activeConversation) {
      // Mettre à jour la liste des conversations pour refléter la conversation active
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id ? activeConversation : conv
      ));
    }
  }, [activeConversation]);

  // Gérer la sélection d'une conversation
  const handleConversationSelect = useCallback(async (conversation) => {
    try {
      setActiveConversation(conversation);
      await loadMessages(conversation.id);
      markConversationAsRead(conversation.id);
      
      if (window.innerWidth < 768) {
        setShowMobileConversations(false);
      }
    } catch (error) {
      setError("Impossible de charger les messages");
    }
  }, [loadMessages, markConversationAsRead]);

  // Fonction pour actualiser la conversation courante
  const refreshCurrentConversation = useCallback(() => {
    if (activeConversation) {
      console.log("Actualisation de la conversation courante:", activeConversation.id);
      handleConversationSelect(activeConversation);
    }
  }, [activeConversation, handleConversationSelect]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessageError("");
    setSendingMessage(true);
    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setMessageError("L'envoi du message a échoué. Veuillez réessayer.");
      // Ne pas effacer le message pour permettre à l'utilisateur de réessayer
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartAdminConversation = async () => {
    try {
      const defaultMessage = "Bonjour, j'aurais besoin d'assistance concernant ma réservation.";
      console.log("Démarrage d'une nouvelle conversation avec l'admin");
      await startConversationWithAdmin(defaultMessage);
      // Attendre un peu pour que l'état se mette à jour
      setTimeout(() => {
        loadConversations();
        if (window.innerWidth < 768) {
          setShowMobileConversations(false);
        }
      }, 500);
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation avec l'admin:", error);
    }
  };

  const handleRefresh = async () => {
    setSyncStatus("updating");
    try {
      await refreshData();
      console.log("Données rafraîchies avec succès");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error);
    } finally {
      setSyncStatus("active");
    }
  };

  const confirmDeleteConversation = (conversation, e) => {
    e.stopPropagation(); // Eviter de sélectionner la conversation
    setConversationToDelete(conversation);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      console.log(`Suppression de la conversation ${conversationToDelete.id}`);
      await deleteConversation(conversationToDelete.id);
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
      
      // Si nous avons supprimé toutes les conversations, il n'y a plus de conversation active
      if (conversations.length === 1) {
        // C'était la dernière conversation
        setActiveConversation(null);
      } else if (conversations.length > 1 && activeConversation?.id === conversationToDelete.id) {
        // Sélectionner une autre conversation
        const nextConversation = conversations.find(c => c.id !== conversationToDelete.id);
        if (nextConversation) {
          loadMessages(nextConversation.id);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
    }
  };

  // Formater l'heure d'un message
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Formater la date de la dernière activité d'une conversation
  const formatLastActiveTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return "Hier";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  };

  // Obtenir le nom du destinataire
  const getRecipientName = useCallback((conversation) => {
    if (!conversation || !conversation.participants) {
      return "...";
    }

    // Filtrer les participants pour ne garder que ceux qui ne sont pas l'utilisateur actuel
    const otherParticipants = conversation.participants.filter(p => p.id !== user?.id);
    
    if (otherParticipants.length === 0) {
      // Si aucun autre participant, utiliser le premier participant disponible (peut être nous-mêmes)
      return conversation.participants[0]?.nom || "...";
    } else if (otherParticipants.length === 1) {
      // Un seul autre participant - utiliser son nom
      return otherParticipants[0].nom;
    } else {
      // Plusieurs autres participants - utiliser leurs noms joints par des virgules
      return otherParticipants.map(p => p.nom).join(", ");
    }
  }, [user]);

  // Obtenir l'ID du destinataire
  const getRecipientId = useCallback((conversation) => {
    if (!conversation || !conversation.participants) {
      return null;
    }

    // Filtrer les participants pour ne garder que ceux qui ne sont pas l'utilisateur actuel
    const otherParticipants = conversation.participants.filter(p => p.id !== user?.id);
    
    if (otherParticipants.length === 0) {
      // Si aucun autre participant, utiliser le premier participant disponible
      return conversation.participants[0]?.id || null;
    } else if (otherParticipants.length === 1) {
      // Un seul autre participant - utiliser son ID
      return otherParticipants[0].id;
    } else {
      // Plusieurs autres participants - utiliser le premier ID trouvé (c'est un cas rare)
      return otherParticipants[0]?.id || null;
    }
  }, [user]);

  // Vérifier si le message a un expéditeur valide
  const getMessageSenderId = (message) => {
    if (!message) return null;
    return message.senderId || (message.sender && message.sender.id);
  };

  // Obtenir le nom de l'expéditeur pour l'affichage des messages
  const getMessageSenderName = (message) => {
    if (!message || !message.sender) return "Inconnu";

    // Si l'expéditeur est l'utilisateur actuel
    if (message.sender.id === user?.id) {
      return "Vous";
    }

    // Si l'expéditeur est un administrateur
    if (message.sender.id === 1 || message.sender.isAdmin) {
      return "Admin";
    }

    // Dans tous les autres cas, utiliser le nom original du sender
    return message.sender.nom || `Utilisateur #${message.sender.id}`;
  };

  // Effet visuel pour les nouveaux messages
  useEffect(() => {
    if (hasNewMessages) {
      // Afficher un indicateur visuel
      setShowNotification(true);
      
      // Le masquer après 3 secondes
      const timeout = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [hasNewMessages]);

  // Détecter les nouveaux messages et les marquer pour l'animation
  useEffect(() => {
    if (!messages || messages.length === 0) {
      prevMessagesLengthRef.current = 0;
      return;
    }
    
    // Si nous avons plus de messages qu'avant
    if (messages.length > prevMessagesLengthRef.current) {
      // Trouver les IDs des nouveaux messages
      const newIds = messages
        .slice(prevMessagesLengthRef.current)
        .map(msg => msg.id);
      
      if (newIds.length > 0) {
        console.log(`${newIds.length} nouveaux messages détectés pour l'animation:`, newIds);
        
        // Ajouter les nouveaux IDs à la liste
        setNewMessageIds(newIds);
        
        // Nettoyer la liste après l'animation
        setTimeout(() => {
          setNewMessageIds([]);
        }, 1000);
      }
    }
    
    // Mettre à jour le compteur
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Simuler un indicateur de synchronisation temps réel - Réduire la fréquence
  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncStatus("updating");
      setTimeout(() => setSyncStatus("active"), 500);
    }, 30000); // Augmenté à 30 secondes
    
    return () => clearInterval(syncInterval);
  }, []);

  if (loading && !initialLoadDone) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notification visuelle - Supprimée car maintenant gérée globalement 
      {showNotification && (
        <div className="fixed top-4 right-4 bg-rose-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse z-50 flex items-center">
          <FaBell className="mr-2" />
          Nouveau message reçu!
        </div>
      )}
      */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Messagerie</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === "active" ? "bg-green-500" : 
              syncStatus === "updating" ? "bg-amber-500 animate-blink" : "bg-gray-300"
            }`}></div>
            <span className="hidden sm:inline">Synchronisation en temps réel</span>
          </div>
          <button
            onClick={() => {
              // Utiliser la fonction du contexte pour tester le son
              testNotificationSound()
                .then(() => {
                  console.log("Test de son réussi via le contexte");
                  // Mettre à jour les préférences si le son était désactivé
                  localStorage.setItem('message_sound_enabled', 'true');
                  setSoundEnabled(true);
                })
                .catch(error => console.error("Erreur lors du test de son:", error));
            }}
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-200"
            title="Tester le son"
          >
            <FaVolumeUp className="animate-pulse-once" />
          </button>
          <button
            onClick={() => {
              const newState = !soundEnabled;
              setSoundEnabled(newState);
              localStorage.setItem('message_sound_enabled', String(newState));
            }}
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-200"
            title={soundEnabled ? "Désactiver les notifications sonores" : "Activer les notifications sonores"}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
        </div>
      </div>
      
      {/* Version mobile: bouton pour basculer entre les conversations et les messages */}
      <div className="block md:hidden mb-4">
        <button 
          onClick={() => setShowMobileConversations(!showMobileConversations)}
          className="bg-rose-500 text-white px-4 py-2 rounded-md"
        >
          {showMobileConversations ? "Voir les messages" : "Voir les conversations"}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden h-[calc(85vh)]">
        {/* Liste des conversations (masquable sur mobile) */}
        <div className={`${showMobileConversations ? 'block' : 'hidden'} md:block w-full md:w-1/3 border-r overflow-y-auto h-full`}>
          {/* En-tête de la liste des conversations avec bouton de suppression */}
          <div className="flex justify-between items-center p-3 bg-gray-100 border-b">
            <h2 className="text-lg font-semibold">Conversations</h2>
            
            {/* Actions globales */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="p-2 text-red-500 hover:bg-gray-200 rounded-full"
                title="Supprimer toutes les conversations"
              >
                <FaTrash size={16} />
              </button>
              <button
                onClick={refreshData}
                className={`p-2 ${syncStatus === "updating" ? "text-amber-500 animate-spin" : "text-gray-500"} hover:bg-gray-200 rounded-full`}
                title="Rafraîchir les conversations"
              >
                <FaSync size={16} />
              </button>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="p-2 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch size={14} />
              </span>
            </div>
          </div>
          
          {/* Bouton pour démarrer une conversation avec l'admin */}
          <div className="p-4 hover:bg-gray-100 cursor-pointer" onClick={handleStartAdminConversation}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                <FaUser size={20} />
              </div>
              <div className="ml-4">
                <div className="font-semibold">Admin</div>
                <div className="text-sm text-gray-500">Support & Assistance</div>
              </div>
            </div>
          </div>
          
          {/* Liste des conversations */}
          <div>
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conversation => {
                // S'assurer que unreadCount est strictement supérieur à 0 
                // (vérification renforcée pour éviter d'afficher le 0)
                const unreadCount = conversation.unreadCount || 0;
                const hasUnread = unreadCount > 0;
                
                return (
                  <div 
                    key={conversation.id} 
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 hover:bg-gray-100 cursor-pointer ${
                      activeConversation?.id === conversation.id ? 'bg-rose-50' : ''
                    } ${hasUnread ? 'border-l-4 border-rose-500' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${hasUnread ? 'bg-rose-100' : 'bg-gray-200'} rounded-full flex items-center justify-center relative`}>
                        <FaUser size={20} className={`${hasUnread ? 'text-rose-500' : 'text-gray-500'}`} />
                        {/* Badge de notification uniquement si unreadCount est strictement supérieur à 0 */}
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div className={`font-semibold ${hasUnread ? 'text-rose-600' : ''}`}>
                            {getRecipientId(conversation) && user.role === 'admin' ? (
                              <span
                                className={`hover:text-rose-600 hover:underline flex items-center ${hasUnread ? 'text-rose-600 font-bold' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation(); // Empêcher la propagation au parent
                                  navigate(`/admin/client/${String(getRecipientId(conversation))}`);
                                }}
                              >
                                {getRecipientName(conversation)}
                                <FaExternalLinkAlt className="ml-1 text-xs text-gray-400 hover:text-rose-500" title="Voir le profil complet" />
                              </span>
                            ) : (
                              getRecipientName(conversation)
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {hasUnread && <span className="inline-block mr-1 w-2 h-2 bg-rose-500 rounded-full"></span>}
                            {formatLastActiveTime(conversation.lastMessageAt)}
                          </div>
                        </div>
                        <div className={`text-sm ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'} truncate`}>
                          {conversation.lastMessageContent}
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (conversationToDelete === conversation.id) {
                              setConversationToDelete(null);
                            } else {
                              setConversationToDelete(conversation.id);
                            }
                            setShowDeleteConfirm(false);
                            setShowClearMessagesConfirm(false);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          aria-label="Options de conversation"
                        >
                          <FaEllipsisV />
                        </button>
                        
                        {conversationToDelete === conversation.id && (
                          <div className="absolute right-0 top-8 bg-white shadow-md rounded-md z-10 w-48">
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowClearMessagesConfirm(false);
                                setShowDeleteConfirm(true);
                              }}
                            >
                              <FaTrash size={14} /> Supprimer
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-orange-600 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(false);
                                setShowClearMessagesConfirm(true);
                              }}
                            >
                              <FaTrash size={14} /> Vider les messages
                            </button>
                          </div>
                        )}
                        
                        {showDeleteConfirm && conversationToDelete === conversation.id && (
                          <div className="absolute right-0 top-8 bg-white shadow-md rounded-md z-20 p-3 w-64">
                            <p className="text-sm mb-2">Supprimer cette conversation ?</p>
                            <div className="flex justify-end gap-2">
                              <button
                                className="px-3 py-1 bg-gray-200 rounded-md text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(false);
                                }}
                              >
                                Annuler
                              </button>
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                                onClick={async () => {
                                  try {
                                    await deleteConversation(conversation.id);
                                    setShowDeleteConfirm(false);
                                    setConversationToDelete(null);
                                  } catch (error) {
                                    console.error("Erreur lors de la suppression:", error);
                                  }
                                }}
                              >
                                Confirmer
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {showClearMessagesConfirm && conversationToDelete === conversation.id && (
                          <div className="absolute right-0 top-8 bg-white shadow-md rounded-md z-20 p-3 w-64">
                            <p className="text-sm mb-2">Vider tous les messages de cette conversation ?</p>
                            <div className="flex justify-end gap-2">
                              <button
                                className="px-3 py-1 bg-gray-200 rounded-md text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowClearMessagesConfirm(false);
                                }}
                              >
                                Annuler
                              </button>
                              <button
                                className="px-3 py-1 bg-orange-500 text-white rounded-md text-sm"
                                onClick={async () => {
                                  try {
                                    await clearConversationMessages(conversation.id);
                                    setShowClearMessagesConfirm(false);
                                    setConversationToDelete(null);
                                  } catch (error) {
                                    console.error("Erreur lors de la suppression des messages:", error);
                                  }
                                }}
                              >
                                Vider
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">
                <FaInbox className="mx-auto mb-2 text-gray-300" size={40} />
                <p>Aucune conversation trouvée.</p>
                <p className="mt-2 text-sm">Commencez à discuter avec notre équipe.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Zone de messages (masquable sur mobile) */}
        <div className={`${!showMobileConversations ? 'block' : 'hidden'} md:block flex-1 flex flex-col h-full overflow-hidden`}>
          {activeConversation ? (
            <>
              {/* En-tête de la conversation - hauteur fixe */}
              <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                <div className="flex items-center">
                  <button className="md:hidden mr-2" onClick={() => setShowMobileConversations(true)}>
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUser size={16} className="text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">
                      {getRecipientId(activeConversation) && user.role === 'admin' ? (
                        <span 
                          className="hover:text-rose-600 hover:underline flex items-center cursor-pointer"
                          onClick={() => navigate(`/admin/client/${String(getRecipientId(activeConversation))}`)}
                        >
                          {getRecipientName(activeConversation)}
                          <FaExternalLinkAlt className="ml-1 text-xs text-gray-400 hover:text-rose-500" title="Voir le profil complet" />
                        </span>
                      ) : (
                        getRecipientName(activeConversation)
                      )}
                    </div>
                    <div className="text-xs text-green-500">En ligne</div>
                  </div>
                </div>
                <button 
                  className="text-gray-500 hover:text-red-500 p-2"
                  onClick={() => confirmDeleteConversation(activeConversation, new Event('click'))}
                  title="Supprimer la conversation"
                >
                  <FaTrash />
                </button>
              </div>
              
              {/* Messages - zone de défilement avec hauteur calculée */}
              <div 
                ref={containerRef}
                className="flex-1 p-4 overflow-y-auto bg-gray-50" 
                style={{ height: 'calc(100% - 140px)' }}
              >
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <ClipLoader color="#4F46E5" size={50} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    <p>Aucun message pour le moment</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.sender?.id === user?.id;
                    const senderName = getMessageSenderName(message);
                    
                    return (
                      <div
                        key={message.id || index}
                        className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
                      >
                        {/* Nom de l'expéditeur - affiché seulement si ce n'est pas nous */}
                        {!isCurrentUser && (
                          <span className="text-xs text-gray-500 mb-1 ml-2">{senderName}</span>
                        )}
                        
                        <div
                          className={`max-w-3/4 p-3 rounded-lg ${
                            isCurrentUser
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-gray-200 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          {message.content}
                        </div>
                        
                        <span className="text-xs text-gray-500 mt-1 mr-1">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div id="messages-end" ref={messagesEndRef}></div>
              </div>
              
              {/* Message error display */}
              {messageError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    <span>{messageError}</span>
                  </div>
                  <div className="flex items-center">
                    <button 
                      onClick={refreshCurrentConversation} 
                      className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-indigo-700"
                    >
                      <FaSync className="mr-1" /> Rafraîchir
                    </button>
                    <button 
                      onClick={() => setMessageError(null)} 
                      className="ml-2 text-red-700 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              {/* Saisie de message - hauteur fixe */}
              <div className="p-4 border-t flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex flex-col">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage || !activeConversation}
                    />
                    <button 
                      type="submit"
                      className={`${sendingMessage ? 'bg-rose-400' : 'bg-rose-500 hover:bg-rose-600'} text-white px-4 py-2 rounded-r-md focus:outline-none flex items-center justify-center min-w-[48px]`}
                      disabled={sendingMessage || !newMessage.trim() || !activeConversation}
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <FaInbox size={50} className="mb-3 text-gray-300" />
              <p className="text-xl font-semibold mb-2">Aucune conversation sélectionnée</p>
              <p>Sélectionnez une conversation existante ou commencez-en une nouvelle avec notre équipe.</p>
              <button 
                onClick={handleStartAdminConversation}
                className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-md hover:bg-rose-600"
              >
                Contacter l'admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation pour supprimer toutes les conversations */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4">Confirmation</h3>
            <p className="mb-6">Voulez-vous vraiment supprimer toutes les conversations ?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowClearAllConfirm(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={async () => {
                  try {
                    await clearAllConversations();
                    setShowClearAllConfirm(false);
                  } catch (error) {
                    console.error("Erreur lors de la suppression de toutes les conversations:", error);
                  }
                }}
              >
                Supprimer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages; 