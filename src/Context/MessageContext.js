import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

// Créer l'instance axios en dehors du composant
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const notificationSound = useRef(null);
  const socketRef = useRef(null);

  // Fonction pour jouer le son de notification
  const playNotificationSound = useCallback(() => {
    const soundEnabled = localStorage.getItem('message_sound_enabled');
    if (soundEnabled === 'false') return;

    try {
      const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      sound.volume = 0.8;
      sound.play()
        .then(() => console.log("Son joué avec succès"))
        .catch(error => console.warn("Erreur de lecture du son:", error));
    } catch (error) {
      console.error("Erreur critique lors de la lecture du son:", error);
    }
  }, []);

  // Initialiser le son de notification
  useEffect(() => {
    try {
      notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      notificationSound.current.volume = 0.8;
      notificationSound.current.preload = 'auto';
      notificationSound.current.load();

      return () => {
        if (notificationSound.current) {
          notificationSound.current.pause();
          notificationSound.current = null;
        }
      };
    } catch (error) {
      console.error("Erreur lors de l'initialisation du son:", error);
    }
  }, []);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const url = user.role === 'admin'
        ? "/messages/admin/conversations"
        : "/messages/conversations";

      const response = await api.get(url);

      if (response.data) {
        const processedConversations = response.data.map(conversation => {
          if (conversation.participants && Array.isArray(conversation.participants)) {
            if (user.role === 'admin') {
              return conversation;
            } else {
              conversation.participants = conversation.participants.map(participant => {
                if (participant.id === 1 || participant.isAdmin) {
                  return { ...participant, nom: "Admin" };
                }
                return participant;
              });
            }
          }
          return conversation;
        });

        setConversations(processedConversations);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
      setError("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);

      if (response.data) {
        const processedMessages = response.data.map(message => {
          if (user?.role === 'admin') {
            return message;
          }
          if (message.sender.id === 1 || message.sender.isAdmin) {
            return {
              ...message,
              sender: { ...message.sender, nom: "Admin" }
            };
          }
          return message;
        });

        setMessages(processedMessages);

        // Marquer les messages comme lus
        socketRef.current?.emit("markAsRead", conversationId);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setError("Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Envoyer un message
  const sendMessage = useCallback(async (content) => {
    if (!content || !user || !activeConversation) {
      setError("Impossible d'envoyer un message: informations manquantes");
      return false;
    }

    try {
      const response = await api.post(`/messages/conversations/${activeConversation.id}/messages`, {
        content: content
      });

      if (response.data) {
        // Mettre à jour les messages avec le nouveau message
        setMessages(prevMessages => [...prevMessages, response.data]);

        // Mettre à jour la conversation active avec le dernier message
        setActiveConversation(prev => ({
          ...prev,
          lastMessageContent: content,
          lastMessageAt: new Date().toISOString()
        }));

        return true;
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError("L'envoi du message a échoué");
      return false;
    }
  }, [user, activeConversation]);

  // Supprimer une conversation
  const deleteConversation = useCallback(async (conversationId) => {
    if (!user || !conversationId) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/messages/conversations/${conversationId}`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
      setError("Impossible de supprimer la conversation");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Supprimer tous les messages d'une conversation
  const clearConversationMessages = useCallback(async (conversationId) => {
    if (!user || !conversationId) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/messages/conversations/${conversationId}/messages`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des messages:", error);
      setError("Impossible de supprimer les messages");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Supprimer toutes les conversations
  const clearAllConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`/messages/conversations`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des conversations:", error);
      setError("Impossible de supprimer toutes les conversations");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Démarrer une conversation avec un utilisateur
  const startConversationWithUser = useCallback(async (userId, initialMessage) => {
    if (!user || !userId) {
      throw new Error("Informations manquantes pour démarrer la conversation");
    }

    try {
      const response = await api.post("/messages/conversations", {
        participantId: userId,
        initialMessage: initialMessage || "Bonjour !"
      });

      if (response.data) {
        await loadConversations();
        setActiveConversation(response.data);
        await loadMessages(response.data.id);
        return response.data;
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation:", error);
      throw new Error("Impossible de démarrer la conversation");
    }
  }, [user, loadConversations, loadMessages]);

  // Démarrer une conversation avec l'admin
  const startConversationWithAdmin = useCallback(async (initialMessage) => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      console.log("Démarrage d'une conversation avec l'admin...");
      const response = await api.post("/messages/conversations", {
        participantId: 1, // ID de l'admin
        initialMessage: initialMessage || "Bonjour, j'ai besoin d'assistance."
      });

      if (response.data) {
        console.log("Conversation avec l'admin créée:", response.data);
        // Mettre à jour la liste des conversations
        setConversations(prev => [response.data, ...prev]);
        // Définir la conversation active
        setActiveConversation(response.data);
        // Charger les messages
        await loadMessages(response.data.id);
        return response.data;
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation avec l'admin:", error);
      throw new Error("Impossible de démarrer la conversation avec l'admin");
    }
  }, [user, loadMessages]);

  // Initialiser Socket.IO
  useEffect(() => {
    if (!user) return;

    // Si une connexion existe déjà, ne pas en créer une nouvelle
    if (socketRef.current?.connected) return;

    // Nettoyer l'ancienne connexion si elle existe
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      auth: {
        userId: user.id
      },
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
      // Désactiver la reconnexion automatique
      reconnection: false
    });

    let isFirstConnection = true;

    socketRef.current.on('connect', () => {
      if (isFirstConnection) {
        console.log('✅ Socket.IO connecté');
        isFirstConnection = false;
      }
      setError(null);
    });

    socketRef.current.on('connect_error', (error) => {
      if (isFirstConnection) {
        console.error('❌ Erreur Socket.IO:', error.message);
        setError("Impossible de se connecter au serveur de messagerie");
        isFirstConnection = false;
      }
    });

    socketRef.current.on('newMessage', (message) => {
      // Mettre à jour les messages si la conversation active correspond
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages(prevMessages => {
          // Vérifier si le message existe déjà
          if (prevMessages.some(msg => msg.id === message.id)) {
            return prevMessages;
          }
          return [...prevMessages, message];
        });

        // Mettre à jour la conversation active
        setActiveConversation(prev => ({
          ...prev,
          lastMessageContent: message.content,
          lastMessageAt: message.createdAt
        }));

        // Marquer comme lu
        socketRef.current?.emit("markAsRead", message.conversationId);
      }

      // Mettre à jour la liste des conversations
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessageContent: message.content,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId !== user.id ? (conv.unreadCount || 0) + 1 : conv.unreadCount
            };
          }
          return conv;
        });
      });

      // Jouer le son uniquement si ce n'est pas notre message
      if (message.senderId !== user.id) {
        playNotificationSound();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, activeConversation, playNotificationSound]);

  // Charger les conversations à l'initialisation
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Marquer une conversation comme lue
  const markConversationAsRead = useCallback(async (conversationId) => {
    if (!conversationId || !user) return;

    try {
      // Émettre l'événement via Socket.IO
      socketRef.current?.emit("markAsRead", conversationId);

      // Mettre à jour l'état local
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0
          };
        }
        return conv;
      }));

      // Mettre à jour les messages comme lus
      setMessages(prev => prev.map(msg =>
        msg.conversationId === conversationId && msg.senderId !== user.id
          ? { ...msg, isRead: true }
          : msg
      ));
    } catch (error) {
      console.error("Erreur lors du marquage de la conversation comme lue:", error);
    }
  }, [user]);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        activeConversation,
        loading,
        error,
        unreadCount,
        hasNewMessages,
        setActiveConversation,
        setMessages,
        setLoading,
        setError,
        setConversations,
        loadConversations,
        loadMessages,
        sendMessage,
        deleteConversation,
        clearConversationMessages,
        clearAllConversations,
        startConversationWithUser,
        startConversationWithAdmin,
        markConversationAsRead
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);

export default MessageContext; 