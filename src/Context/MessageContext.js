import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";

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
  const previousMessagesCount = useRef({});

  // Initialiser le son de notification avec un lien externe plus court
  useEffect(() => {
    try {
      // Utiliser un son plus court et plus simple pour éviter les blocages
      notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      notificationSound.current.volume = 0.8; // Volume plus élevé (80%)
      notificationSound.current.preload = 'auto'; // Préchargement complet
      
      // Précharger le son pour une lecture immédiate
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

  // Fonction pour afficher une notification du navigateur
  const showBrowserNotification = useCallback(() => {
    // Vérifier si les notifications sont supportées
    if (!("Notification" in window)) {
      console.warn("Ce navigateur ne prend pas en charge les notifications desktop");
      return;
    }
    
    // Vérifier si les permissions sont déjà accordées
    if (Notification.permission === "granted") {
      // Créer et afficher la notification
      const notification = new Notification("Nouveau message", {
        body: "Vous avez reçu un nouveau message",
        icon: "/logo192.png", // Si vous avez une icône
        tag: "new-message"
      });
      
      // Action au clic sur la notification
      notification.onclick = function() {
        window.focus(); // Focus sur la fenêtre de l'application
        notification.close();
        window.location.href = '/messages'; // Rediriger vers la page des messages
      };
    }
    // Demander la permission si elle n'est pas encore accordée
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          // Réessayer d'afficher la notification
          showBrowserNotification();
        }
      });
    }
  }, []);

  // Fonction pour jouer le son de notification avec une méthode plus fiable
  const playNotificationSound = useCallback(() => {
    // Vérifier si le son est activé dans les préférences utilisateur
    const soundEnabled = localStorage.getItem('message_sound_enabled');
    if (soundEnabled === 'false') {
      console.log("Son désactivé par l'utilisateur");
      return;
    }
    
    console.log("Lecture du son de notification...");
    
    try {
      // Créer un nouvel élément audio à chaque fois (plus fiable)
      const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      sound.volume = 0.8;
      
      // Lecture immédiate avec gestion d'erreur simplifiée
      sound.play()
        .then(() => console.log("Son joué avec succès"))
        .catch(error => console.warn("Erreur de lecture du son:", error));
        
      // Essayer également d'afficher une notification du navigateur
      showBrowserNotification();
    } catch (error) {
      console.error("Erreur critique lors de la lecture du son:", error);
    }
  }, [showBrowserNotification]);

  // Demander la permission de notification au chargement
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      console.log("Demande de permission pour les notifications...");
      Notification.requestPermission();
    }
  }, []);

  // Configuration d'axios avec les credentials
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  });

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Utiliser un endpoint différent pour les administrateurs afin de récupérer toutes les conversations
      const url = user.role === 'admin' 
        ? "/messages/admin/conversations" 
        : "/messages/conversations";
      
      console.log(`Chargement des conversations via ${url}...`);
      const response = await api.get(url);
      
      if (response.data) {
        console.log("Données brutes des conversations:", response.data);
        
        // NE PAS modifier les noms des participants pour préserver les noms d'origine
        // Juste assigner directement les données
        setConversations(response.data);
        console.log(`${response.data.length} conversation(s) chargée(s)`);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des conversations:", error);
      setError("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les messages d'une conversation avec un log détaillé
  const loadMessages = useCallback(async (conversationId) => {
    if (!user || !conversationId) {
      console.log("Impossible de charger les messages: utilisateur non connecté ou ID de conversation manquant");
      return;
    }
    
    console.log(`Chargement des messages pour la conversation ${conversationId}...`);
    
    try {
      // 1. Indiquer le chargement
      setLoading(true);
      setError(null);
      
      // 2. Vider les messages précédents immédiatement
      setMessages([]);
      
      // 3. Définir la conversation active pour améliorer la réactivité
      // Rechercher dans les conversations existantes
      const foundConversation = conversations.find(c => c.id === Number(conversationId));
      
      if (foundConversation) {
        console.log("Conversation trouvée dans la liste existante:", foundConversation.id);
        setActiveConversation(foundConversation);
      } else {
        // Si la conversation n'est pas trouvée dans la liste, essayer de la récupérer directement
        console.warn(`Conversation ${conversationId} non trouvée dans la liste, récupération directe...`);
        
        try {
          const convResponse = await api.get(`/messages/conversations/${conversationId}`);
          if (convResponse.data) {
            console.log("Conversation récupérée directement:", convResponse.data);
            setActiveConversation(convResponse.data);
            
            // Ajouter cette conversation à la liste si elle n'y est pas déjà
            setConversations(prev => {
              if (!prev.some(c => c.id === Number(conversationId))) {
                return [convResponse.data, ...prev];
              }
              return prev;
            });
          } else {
            console.error("Conversation introuvable même par API");
            setError("Conversation introuvable");
            setLoading(false);
            return;
          }
        } catch (convError) {
          console.error("Erreur lors de la récupération de la conversation:", convError);
          setError("Impossible de charger la conversation");
          setLoading(false);
          return;
        }
      }
      
      // 4. Récupérer les messages - toujours exécuté même si la conversation existe déjà
      console.log(`Récupération des messages pour la conversation ${conversationId}...`);
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      console.log(`${response.data ? response.data.length : 0} messages récupérés`);
      
      if (response.data) {
        // 5. Utiliser les messages tels quels, sans modifier les noms
        setMessages(response.data);
        
        // 6. Défiler vers le bas
        setTimeout(() => {
          try {
            const messagesEnd = document.getElementById('messages-end');
            if (messagesEnd) {
              messagesEnd.scrollIntoView({ behavior: 'smooth' });
            }
          } catch (scrollError) {
            console.warn("Erreur de défilement:", scrollError);
          }
        }, 100);
      } else {
        // Pas de messages dans cette conversation
        setMessages([]);
      }
      
      // 7. Marquer les messages comme lus
      try {
        await api.put(`/messages/conversations/${conversationId}/read`);
        
        // 8. Mettre à jour le compteur de messages non lus
        setConversations(prev => 
          prev.map(conv => 
            conv.id === Number(conversationId) 
              ? { ...conv, unreadCount: 0 } 
              : conv
          )
        );
      } catch (readError) {
        console.warn("Erreur lors du marquage des messages comme lus:", readError);
        // Continuer malgré cette erreur
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      setError("Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  }, [user, conversations, api]);

  // Envoyer un message
  const sendMessage = useCallback(async (content) => {
    // Valider l'entrée
    if (!content || !user || !activeConversation) {
      setError("Impossible d'envoyer un message: informations manquantes");
      return false;
    }

    try {
      console.log(`Envoi d'un message à la conversation ${activeConversation.id}`);
      
      // Envoi direct de la requête à l'API
      const response = await api.post(`/messages/conversations/${activeConversation.id}/messages`, {
        content: content
      });
      
      if (response.data) {
        console.log("Message envoyé avec succès:", response.data);
        
        // Ajouter le message à la liste des messages
        setMessages(prevMessages => [...prevMessages, response.data]);
        
        // Défiler vers le bas pour montrer le nouveau message
        setTimeout(() => {
          try {
            const messagesEnd = document.getElementById('messages-end');
            if (messagesEnd) {
              messagesEnd.scrollIntoView({ behavior: 'smooth' });
            }
          } catch (scrollError) {
            console.warn("Erreur de défilement:", scrollError);
          }
        }, 100);
        
        return true;
      } else {
        console.error("Erreur d'envoi: réponse sans données");
        setError("L'envoi du message a échoué");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      
      if (error.response) {
        console.log("Détails de l'erreur:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Si c'est une erreur 403, essayer de recharger la conversation
        if (error.response.status === 403) {
          console.log("Erreur 403 - Tentative de rechargement de la conversation...");
          try {
            // Recharger la liste des conversations
            await loadConversations();
            setError("Autorisation insuffisante. La conversation a été rechargée, veuillez réessayer.");
          } catch (reloadError) {
            console.error("Échec du rechargement:", reloadError);
            setError("Autorisation insuffisante pour envoyer des messages (403)");
          }
        } else {
          setError(`Erreur ${error.response.status}: ${error.response.data?.message || "L'envoi du message a échoué"}`);
        }
      } else {
        setError("Erreur réseau lors de l'envoi du message");
      }
      
      return false;
    }
  }, [user, activeConversation, api, loadConversations]);

  // Démarrer une conversation avec l'admin
  const startConversationWithAdmin = useCallback(async (initialMessage = "Bonjour, j'ai besoin d'assistance.") => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Toujours créer une nouvelle conversation avec l'admin (ID 1)
      const response = await api.post(
        "/messages/conversations", 
        { 
          participantIds: [1], // ID de l'admin explicitement défini
          initialMessage: initialMessage 
        }
      );
      
      if (response.data) {
        const { conversation, message } = response.data;
        
        // Vérifier et corriger la structure de la conversation
        if (!conversation.participants || !Array.isArray(conversation.participants)) {
          conversation.participants = [{ id: 1, nom: "Admin", isAdmin: true }];
        } else {
          // Corriger le nom uniquement pour l'administrateur (ID 1)
          conversation.participants = conversation.participants.map(participant => {
            if (participant.id === 1 || participant.isAdmin) {
              return { ...participant, nom: "Admin" };
            }
            return participant;
          });
          
          // S'assurer que l'admin est dans les participants
          if (!conversation.participants.some(p => p.id === 1)) {
            conversation.participants.push({ id: 1, nom: "Admin", isAdmin: true });
          }
        }
        
        // Ajouter la nouvelle conversation en tête de liste
        setConversations(prevConversations => {
          const newConversations = [conversation, ...prevConversations];
          console.log("Conversations après ajout:", newConversations);
          return newConversations;
        });
        
        // Définir la conversation active
        setActiveConversation(conversation);
        
        // S'assurer que le message a la bonne structure
        const messageWithSender = {
          ...message,
          sender: message.sender || { id: user.id, nom: user.nom }
        };
        
        // Ajouter le message initial
        setMessages([messageWithSender]);
        
        return { conversation, message: messageWithSender };
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation avec l'admin:", error);
      setError("Impossible de démarrer la conversation avec l'administrateur");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, api]);

  // Démarrer une nouvelle conversation
  const startConversation = useCallback(async (participantIds, initialMessage) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(
        "/messages/conversations", 
        { participantIds, initialMessage }
      );
      
      if (response.data) {
        const { conversation, message } = response.data;
        
        // Ajouter la nouvelle conversation à la liste
        setConversations(prev => [conversation, ...prev]);
        
        // Définir la conversation active
        setActiveConversation(conversation);
        
        // S'assurer que le message a la bonne structure
        const messageWithSender = {
          ...message,
          sender: message.sender || { id: user.id, nom: user.nom }
        };
        
        // Ajouter le message initial
        setMessages([messageWithSender]);
        
        return { conversation, message: messageWithSender };
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation:", error);
      setError("Impossible de démarrer la conversation");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Supprimer une conversation
  const deleteConversation = useCallback(async (conversationId) => {
    if (!user || !conversationId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Appel à l'API pour supprimer la conversation
      await api.delete(`/messages/conversations/${conversationId}`);
      
      // Si la conversation supprimée est la conversation active, réinitialiser
      if (activeConversation && activeConversation.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      
      // Mettre à jour la liste des conversations
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      console.log(`Conversation ${conversationId} supprimée avec succès`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
      setError("Impossible de supprimer la conversation");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, api, activeConversation]);

  // Démarrer une conversation avec un utilisateur spécifique (pour l'admin)
  const startConversationWithUser = useCallback(async (userId, initialMessage = "Bonjour, je suis l'administrateur. Comment puis-je vous aider ?") => {
    if (!user || user.role !== 'admin') {
      console.error("Seul l'administrateur peut utiliser cette fonction");
      return;
    }
    
    console.log(`Démarrage d'une conversation avec l'utilisateur ID: ${userId}`);
    setLoading(true);
    setError(null);
    
    try {
      // Créer une nouvelle conversation avec l'utilisateur spécifié
      const response = await api.post(
        "/messages/conversations", 
        { 
          participantIds: [parseInt(userId)], // ID de l'utilisateur ciblé
          initialMessage: initialMessage 
        }
      );
      
      if (response.data) {
        const { conversation, message } = response.data;
        
        console.log("Conversation créée:", conversation);
        console.log("Message initial:", message);
        
        // Vérifier et corriger la structure de la conversation
        if (!conversation.participants || !Array.isArray(conversation.participants)) {
          console.warn("Structure de participants manquante, création...");
          conversation.participants = [
            { id: user.id, nom: "Admin", isAdmin: true },
            { id: parseInt(userId), nom: `Client #${userId}` }
          ];
        } else {
          // S'assurer que seul l'admin a le nom "Admin" et préserver les noms des clients
          conversation.participants = conversation.participants.map(participant => {
            // Modifier uniquement le nom de l'admin (ID 1)
            if (participant.id === 1 || participant.isAdmin) {
              return { ...participant, nom: "Admin" };
            }
            // Préserver le nom original des autres participants (clients)
            return participant;
          });
        }
        
        // Ajouter la nouvelle conversation en tête de liste
        setConversations(prevConversations => {
          // Vérifier si cette conversation existe déjà
          const existingConvIndex = prevConversations.findIndex(
            conv => conv.participants.some(p => p.id === parseInt(userId))
          );
          
          if (existingConvIndex >= 0) {
            // Si la conversation existe, la mettre à jour et la déplacer en haut
            console.log("Conversation existante trouvée, mise à jour");
            const updatedConversations = [...prevConversations];
            updatedConversations[existingConvIndex] = {
              ...conversation,
              lastMessageAt: new Date().toISOString(),
              lastMessageContent: initialMessage
            };
            return updatedConversations;
          } else {
            // Sinon ajouter la nouvelle conversation
            console.log("Ajout d'une nouvelle conversation");
            return [conversation, ...prevConversations];
          }
        });
        
        // Définir la conversation active
        setActiveConversation(conversation);
        
        // S'assurer que le message a la bonne structure
        const messageWithSender = {
          ...message,
          sender: message.sender || { id: user.id, nom: "Admin" }
        };
        
        // Ajouter le message initial
        setMessages([messageWithSender]);
        
        return { conversation, message: messageWithSender };
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation avec l'utilisateur:", error);
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
      }
      setError("Impossible de démarrer la conversation avec l'utilisateur");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, api]);

  // Charger les conversations à l'initialisation
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      // Réinitialiser les états si l'utilisateur est déconnecté
      setConversations([]);
      setMessages([]);
      setActiveConversation(null);
    }
  }, [user, loadConversations]);

  // Définir les fonctions de rafraîchissement avant de les utiliser dans le useEffect

  // Fonction pour vérifier les nouveaux messages sans montrer le loader
  const checkNewMessages = useCallback(async () => {
    if (!user) return;
    
    // Ne pas modifier l'état loading pour ne pas affecter l'UI
    try {
      // Utiliser un endpoint différent pour les administrateurs
      const url = user.role === 'admin' 
        ? "/messages/admin/conversations" 
        : "/messages/conversations";
      
      const response = await api.get(url);
      
      if (response.data) {
        // Ne pas modifier les noms pour préserver les noms originaux
        const newConversations = response.data;
        
        // Vérifier s'il y a de nouvelles conversations
        let hasNewConversations = false;
        if (conversations.length < newConversations.length) {
          console.log("Nouvelle(s) conversation(s) détectée(s)");
          hasNewConversations = true;
          
          // Vérifier si nous n'avons pas de conversation active
          if (!activeConversation && newConversations.length > 0) {
            console.log("Sélection automatique de la nouvelle conversation");
            
            // Charger la première conversation
            const firstConversation = newConversations[0];
            setActiveConversation(firstConversation);
            loadMessages(firstConversation.id);
          }
        }
        
        // Vérifier s'il y a de nouveaux messages
        if (conversations.length > 0) {
          const hasNewMessage = checkForNewUnreadMessages(conversations, newConversations);
          if (hasNewMessage || hasNewConversations) {
            console.log("Nouveau(x) message(s) ou conversation(s) détecté(s) lors de la vérification automatique");
            setHasNewMessages(true);
            playNotificationSound();
            
            // Réinitialiser hasNewMessages après 5 secondes
            setTimeout(() => {
              setHasNewMessages(false);
            }, 5000);
          }
        }
        
        // Mettre à jour les conversations
        setConversations(newConversations);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des nouveaux messages:", error);
      // Ne pas modifier l'état error pour ne pas affecter l'UI
    }
  }, [user, conversations, playNotificationSound, api, activeConversation, loadMessages]);

  // Rafraîchir les messages de la conversation active sans réinitialiser l'état de chargement
  const refreshActiveConversationMessages = useCallback(async () => {
    if (!user || !activeConversation || !activeConversation.id) {
      console.log("Impossible de rafraîchir: pas de conversation active");
      return;
    }

    console.log(`Rafraîchissement des messages pour la conversation ${activeConversation.id}...`);
    
    try {
      // Récupérer les messages mis à jour sans modifier l'état de chargement
      const response = await api.get(`/messages/conversations/${activeConversation.id}/messages`);
      
      if (response.data) {
        console.log(`${response.data.length} messages récupérés lors du rafraîchissement`);
        
        // Comparer avec les messages actuels pour détecter les nouveaux
        const currentMessageIds = messages.map(m => m.id);
        const newMessages = response.data.filter(m => !currentMessageIds.includes(m.id));
        
        // Mettre à jour les messages avec les nouvelles données
        setMessages(response.data);
        
        // Si nouveaux messages et ils ne viennent pas de l'utilisateur actuel, jouer un son
        if (newMessages.length > 0 && newMessages.some(m => m.sender?.id !== user.id)) {
          console.log("Nouveaux messages détectés:", newMessages.length);
          playNotificationSound();
          setHasNewMessages(true);
          
          // Réinitialiser hasNewMessages après 5 secondes
          setTimeout(() => {
            setHasNewMessages(false);
          }, 5000);
        }
        
        // Défiler vers le bas
        setTimeout(() => {
          try {
            const messagesEnd = document.getElementById('messages-end');
            if (messagesEnd) {
              messagesEnd.scrollIntoView({ behavior: 'smooth' });
            }
          } catch (scrollError) {
            console.warn("Erreur de défilement:", scrollError);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des messages:", error);
      // Ne pas modifier l'état d'erreur pour ne pas perturber l'interface
    }
  }, [user, activeConversation, messages, api, playNotificationSound]);

  // Fonction pour comparer deux listes de conversations et détecter les nouveaux messages
  const checkForNewUnreadMessages = (oldConversations, newConversations) => {
    // Vérifier s'il y a de nouvelles conversations
    if (newConversations.length > oldConversations.length) {
      console.log("Nouvelle(s) conversation(s) détectée(s)");
      return true;
    }
    
    // Vérifier s'il y a de nouveaux messages dans les conversations existantes
    for (const newConv of newConversations) {
      const oldConv = oldConversations.find(c => c.id === newConv.id);
      if (!oldConv) continue;
      
      // Vérifier si la dernière activité est plus récente
      if (new Date(newConv.lastMessageAt) > new Date(oldConv.lastMessageAt)) {
        console.log(`Nouveau message dans la conversation ${newConv.id}`);
        return true;
      }
      
      // Vérifier si le compteur de messages non lus a augmenté
      if ((newConv.unreadCount || 0) > (oldConv.unreadCount || 0)) {
        console.log(`Nouveaux messages non lus dans la conversation ${newConv.id}`);
        return true;
      }
    }
    
    return false;
  };

  // Forcer le rechargement des conversations et des messages
  const refreshData = useCallback(async () => {
    if (!user) return;
    
    console.log("Forçage du rechargement des données");
    setLoading(true);
    try {
      await loadConversations();
      
      if (activeConversation && activeConversation.id) {
        await loadMessages(activeConversation.id);
      }
    } catch (error) {
      console.error("Erreur lors du rechargement des données:", error);
    } finally {
      setLoading(false);
    }
  }, [user, loadConversations, loadMessages, activeConversation]);

  // Rafraîchir les conversations périodiquement avec un intervalle plus court
  useEffect(() => {
    if (!user) return;
    
    console.log("Configuration du système de vérification automatique des messages");
    
    // Référence pour suivre si une requête est déjà en cours
    let isCheckingMessages = false;
    let isRefreshingMessages = false;
    
    // Vérifier les nouveaux messages avec une fonction qui évite les appels simultanés
    const safeCheckMessages = async () => {
      // Si une vérification est déjà en cours, ne pas en lancer une nouvelle
      if (isCheckingMessages) {
        console.log("Vérification des messages déjà en cours, ignorée");
        return;
      }
      
      isCheckingMessages = true;
      try {
        await checkNewMessages();
      } catch (error) {
        console.error("Erreur lors de la vérification des messages (gérée):", error);
      } finally {
        isCheckingMessages = false;
      }
    };
    
    // Rafraîchir les messages de la conversation active de manière sécurisée
    const safeRefreshMessages = async () => {
      // Si un rafraîchissement est déjà en cours ou si aucune conversation n'est active, ignorer
      if (isRefreshingMessages || !activeConversation || !activeConversation.id) {
        return;
      }
      
      isRefreshingMessages = true;
      try {
        await refreshActiveConversationMessages();
      } catch (error) {
        console.error("Erreur lors du rafraîchissement des messages (gérée):", error);
      } finally {
        isRefreshingMessages = false;
      }
    };
    
    // Utiliser un intervalle plus long pour réduire la charge
    const intervalId = setInterval(() => {
      safeCheckMessages();
      safeRefreshMessages();
    }, 3000); // 3 secondes au lieu de 1 seconde pour réduire la charge
    
    // Nettoyage à la déconnexion
    return () => {
      console.log("Arrêt de la vérification périodique des messages");
      clearInterval(intervalId);
    };
  }, [user, activeConversation, checkNewMessages, refreshActiveConversationMessages]);

  // Fonction pour tester le son directement (utilisée par le bouton de test)
  const testNotificationSound = useCallback(() => {
    console.log("Test manuel du son de notification");
    
    try {
      // Créer un nouvel élément audio à chaque fois pour le test
      const testSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      testSound.volume = 0.8;
      
      // Lecture immédiate avec promesse
      return testSound.play();
    } catch (error) {
      console.error("Erreur lors du test du son:", error);
      return Promise.reject(error);
    }
  }, []);

  // Supprimer tous les messages d'une conversation
  const clearConversationMessages = useCallback(async (conversationId) => {
    if (!user || !conversationId) return;
    
    setLoading(true);
    setError(null);
    try {
      // Appel à l'API pour supprimer tous les messages
      await api.delete(`/messages/conversations/${conversationId}/messages`);
      
      // Si c'est la conversation active, vider les messages affichés
      if (activeConversation && activeConversation.id === conversationId) {
        setMessages([]);
      }
      
      // Mettre à jour la liste des conversations (pour enlever le dernier message)
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessageContent: "",
            lastMessageAt: new Date().toISOString()
          };
        }
        return conv;
      }));
      
      console.log(`Messages de la conversation ${conversationId} supprimés avec succès`);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des messages:", error);
      setError("Impossible de supprimer les messages de la conversation");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, api, activeConversation]);

  // Supprimer toutes les conversations
  const clearAllConversations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Appel à l'API pour supprimer toutes les conversations
      await api.delete(`/messages/conversations`);
      
      // Réinitialiser l'état
      setConversations([]);
      setMessages([]);
      setActiveConversation(null);
      
      console.log("Toutes les conversations ont été supprimées");
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression des conversations:", error);
      setError("Impossible de supprimer toutes les conversations");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, api]);

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
        loadConversations,
        loadMessages,
        sendMessage,
        startConversation,
        startConversationWithAdmin,
        startConversationWithUser,
        setActiveConversation,
        refreshData,
        deleteConversation,
        testNotificationSound,
        setMessages,
        clearConversationMessages,
        clearAllConversations,
        setLoading,
        setError
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);

export default MessageContext; 