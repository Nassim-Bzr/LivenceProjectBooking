import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

/**
 * Composant invisible qui gère les callbacks de Smoobu
 * À utiliser dans le layout principal de l'application
 */
const SmoobuCallbackHandler = () => {
  const { user } = useAuth();
  const [lastProcessedEvent, setLastProcessedEvent] = useState(null);
  const [debugMode, setDebugMode] = useState(true); // Mode debug activé par défaut

  useEffect(() => {
    // Fonction pour gérer les événements Smoobu
    const handleSmoobuEvents = (event) => {
      // Vérifier que l'événement provient bien de Smoobu ou d'un iframe Smoobu
      if (event.origin.includes('smoobu.com') || event.data?.source === 'smoobu-widget') {
        try {
          console.log('Événement potentiel Smoobu détecté:', event);
          
          // Traiter les données selon différents formats possibles
          let data;
          if (typeof event.data === 'string') {
            try {
              data = JSON.parse(event.data);
            } catch (e) {
              // Si ce n'est pas un JSON, on essaie de trouver des patterns connus dans la chaîne
              if (event.data.includes('booking') || event.data.includes('reservation')) {
                console.log('Détection de mots-clés de réservation dans la chaîne:', event.data);
                // Créer un objet minimal avec l'information disponible
                data = { 
                  type: 'reservation',
                  raw: event.data,
                  timestamp: new Date().toISOString()
                };
              }
            }
          } else {
            data = event.data;
          }
          
          if (!data) {
            return; // Si on n'a pas pu extraire de données exploitables
          }
          
          console.log('Données d\'événement traitées:', data);
          
          // Vérifier si l'événement concerne une réservation
          // Smoobu peut envoyer différents types d'événements sous différents formats
          const isReservationEvent = 
            data.event === 'booking.complete' || 
            data.event === 'booking.created' || 
            data.event === 'reservation_created' ||
            data.action === 'booking' ||
            data.type === 'reservation' ||
            data.smoobuReservation ||
            (data.raw && (
              data.raw.includes('booking') || 
              data.raw.includes('reservation')
            ));
          
          if (isReservationEvent) {
            console.log('Réservation Smoobu détectée!', data);
            
            // Générer un ID d'événement unique pour éviter les doublons
            const eventId = data.id || data.reservationId || data.bookingId || data.smoobuId || JSON.stringify(data);
            
            // Éviter le traitement en double d'un même événement récent (dans les 5 dernières secondes)
            const now = new Date().getTime();
            const lastProcessedTime = localStorage.getItem('lastSmoobuEventTime');
            
            if (lastProcessedEvent === eventId && lastProcessedTime && (now - parseInt(lastProcessedTime)) < 5000) {
              console.log('Événement identique récent déjà traité, ignoré:', eventId);
              return;
            }
            
            setLastProcessedEvent(eventId);
            localStorage.setItem('lastSmoobuEventTime', now.toString());
            
            // Extraire les informations de l'iframe si disponibles
            let additionalInfo = {};
            try {
              // Tenter de récupérer des informations du contexte de la page
              const currentUrl = window.location.href;
              const apartmentMatch = currentUrl.match(/\/appartement\/([^\/]+)/);
              if (apartmentMatch) {
                additionalInfo.apartmentSlug = apartmentMatch[1];
              }
              
              // Récupérer des infos de l'iframe Smoobu si possible
              const smoobuIframe = document.querySelector('iframe[src*="smoobu.com"]');
              if (smoobuIframe) {
                const iframeSrc = smoobuIframe.src;
                const smoobuIdMatch = iframeSrc.match(/\/([0-9]+)$/);
                if (smoobuIdMatch) {
                  additionalInfo.smoobuId = smoobuIdMatch[1];
                }
                
                // Extraire l'ID hôte si possible
                const hosteIdMatch = iframeSrc.match(/\/([0-9]+)\/[0-9]+$/);
                if (hosteIdMatch) {
                  additionalInfo.hosteId = hosteIdMatch[1];
                }
              }
            } catch (err) {
              console.warn('Erreur lors de l\'extraction d\'informations additionnelles:', err);
            }
            
            // Fusionner les informations additionnelles avec les données de l'événement
            const enrichedData = { ...data, ...additionalInfo };
            
            // Enregistrer la réservation dans notre base de données
            if (user) {
              saveSmoobuReservation(enrichedData);
            } else {
              console.warn('Utilisateur non connecté, stockage temporaire de la réservation');
              // Stocker temporairement l'événement en localStorage pour traitement ultérieur
              const pendingEvents = JSON.parse(localStorage.getItem('pendingSmoobuEvents') || '[]');
              pendingEvents.push(enrichedData);
              localStorage.setItem('pendingSmoobuEvents', JSON.stringify(pendingEvents));
              
              // Afficher une notification à l'utilisateur
              alert('Une réservation a été détectée. Veuillez vous connecter pour finaliser votre réservation.');
            }
          }
        } catch (error) {
          console.error('Erreur lors du traitement du message Smoobu:', error);
        }
      }
    };
    
    // Ajouter l'écouteur d'événements
    console.log('SmoobuCallbackHandler: mise en place des écouteurs d\'événements');
    window.addEventListener('message', handleSmoobuEvents);
    
    // Pour capturer des événements non standard
    const originalPostMessage = window.postMessage;
    window.postMessage = function(msg, targetOrigin, transfer) {
      console.log('Interception postMessage:', msg, targetOrigin);
      originalPostMessage.call(this, msg, targetOrigin, transfer);
    };
    
    // Traiter les événements en attente si l'utilisateur est connecté
    if (user) {
      const pendingEvents = JSON.parse(localStorage.getItem('pendingSmoobuEvents') || '[]');
      if (pendingEvents.length > 0) {
        console.log('Traitement des événements Smoobu en attente:', pendingEvents.length);
        pendingEvents.forEach(event => saveSmoobuReservation(event));
        localStorage.removeItem('pendingSmoobuEvents');
      }
    }
    
    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('message', handleSmoobuEvents);
      // Restaurer la fonction postMessage d'origine
      window.postMessage = originalPostMessage;
    };
  }, [user, lastProcessedEvent]);
  
  // Fonction pour enregistrer une réservation Smoobu
  const saveSmoobuReservation = async (data) => {
    try {
      if (!user) return;
      
      console.log('Tentative d\'enregistrement de réservation Smoobu:', data);
      
      // Étape 1: Déterminer l'ID de l'appartement
      let appartementId = null;
      
      // Si data contient directement un ID d'appartement, l'utiliser
      if (data.apartmentId) {
        appartementId = data.apartmentId;
      } 
      // Si data contient un ID Smoobu, chercher l'appartement correspondant
      else if (data.smoobuId) {
        try {
          const appartementsResponse = await axios.get('http://localhost:5000/api/appartements', {
            withCredentials: true
          });
          
          const appartement = appartementsResponse.data.find(a => 
            a.smoobuId && a.smoobuId.toString() === data.smoobuId.toString()
          );
          
          if (appartement) {
            appartementId = appartement.id;
          }
        } catch (error) {
          console.error('Erreur lors de la recherche par smoobuId:', error);
        }
      }
      
      // Si on n'a pas encore trouvé l'appartement, essayer par le slug de l'URL
      if (!appartementId && data.apartmentSlug) {
        try {
          const appartementResponse = await axios.get(`http://localhost:5000/api/appartements/slug/${data.apartmentSlug}`, {
            withCredentials: true
          });
          
          appartementId = appartementResponse.data.id;
        } catch (error) {
          console.error('Erreur lors de la recherche par slug:', error);
        }
      }
      
      // Si toujours pas d'ID d'appartement, essayer de l'extraire de l'URL
      if (!appartementId) {
        const url = window.location.pathname;
        const match = url.match(/\/appartement\/([^\/]+)/);
        
        if (match) {
          const slug = match[1];
          
          try {
            const appartementResponse = await axios.get(`http://localhost:5000/api/appartements/slug/${slug}`, {
              withCredentials: true
            });
            
            appartementId = appartementResponse.data.id;
          } catch (error) {
            console.error('Erreur lors de la récupération des détails de l\'appartement par slug:', error);
          }
        }
      }
      
      // Si on n'a toujours pas d'ID d'appartement, on ne peut pas continuer
      if (!appartementId) {
        console.error('Impossible de déterminer l\'appartement pour la réservation Smoobu');
        alert('Erreur: Impossible d\'identifier l\'appartement pour cette réservation.');
        return;
      }
      
      // Étape 2: Extraire les dates et autres détails de réservation
      // Avec gestion des différents formats possibles envoyés par Smoobu
      const extractDate = (dateStr) => {
        if (!dateStr) return null;
        
        // Si c'est déjà une date valide
        if (dateStr instanceof Date && !isNaN(dateStr)) {
          return dateStr.toISOString().split('T')[0];
        }
        
        // Si c'est une chaîne de caractères
        try {
          const date = new Date(dateStr);
          if (!isNaN(date)) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Erreur de parsing de date:', e);
        }
        
        return null;
      };
      
      // Essayer d'extraire un nombre
      const extractNumber = (value, defaultValue = 0) => {
        if (value === undefined || value === null) return defaultValue;
        
        if (typeof value === 'number') return value;
        
        if (typeof value === 'string') {
          const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
          return isNaN(parsed) ? defaultValue : parsed;
        }
        
        return defaultValue;
      };
      
      // Créer l'objet de réservation avec toutes les données possibles
      const startDate = extractDate(
        data.arrivalDate || data.checkIn || data.start_date || data.startDate || 
        data.arrival || data.check_in || data.dateFrom
      );
      
      const endDate = extractDate(
        data.departureDate || data.checkOut || data.end_date || data.endDate || 
        data.departure || data.check_out || data.dateTo
      );
      
      // Si on n'a pas les dates, on ne peut pas continuer
      if (!startDate || !endDate) {
        console.error('Dates de réservation manquantes ou invalides:', data);
        alert('Erreur: Impossible de déterminer les dates de votre réservation.');
        return;
      }
      
      // ID unique de la réservation Smoobu
      const smoobuReservationId = data.reservationId || data.id || data.bookingId || 
                                  data.smoobuReservationId || Date.now().toString();
      
      // Créer l'objet de réservation final
      const reservation = {
        userId: user.id,
        appartementId: appartementId,
        startDate: startDate,
        endDate: endDate,
        totalPrice: extractNumber(
          data.totalAmount || data.price || data.amount || data.totalPrice || 
          data.total || data.cost || 0
        ),
        status: mapSmoobuStatus(data.status || data.bookingStatus || 'confirmed'),
        guestsCount: extractNumber(
          data.numberOfGuests || data.guests || data.guestsCount || 
          data.nbGuests || data.personCount || 1
        ),
        smoobuReservationId: smoobuReservationId
      };
      
      console.log('Objet de réservation préparé:', reservation);
      
      // Étape 3: Vérifier si la réservation existe déjà
      try {
        const existingResponse = await axios.get(`http://localhost:5000/api/reservations/check-smoobu/${smoobuReservationId}`, {
          withCredentials: true
        });
        
        if (existingResponse.data && existingResponse.data.exists) {
          console.log('Réservation Smoobu déjà existante, mise à jour...');
          
          // Mettre à jour la réservation existante
          await axios.put(
            `http://localhost:5000/api/reservations/${existingResponse.data.id}`,
            reservation,
            {
              withCredentials: true
            }
          );
          
          console.log('Réservation Smoobu mise à jour avec succès');
          return;
        }
      } catch (error) {
        console.warn('Vérification d\'existence échouée, tentative de création:', error);
      }
      
      // Étape 4: Créer une nouvelle réservation
      console.log('Création d\'une nouvelle réservation Smoobu:', reservation);
      
      try {
        // Récupérer le token d'authentification
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.post(
          'http://localhost:5000/api/reservations',
          reservation,
          {
            withCredentials: true,
            headers
          }
        );
        
        console.log('Réservation Smoobu enregistrée avec succès:', response.data);
        
        // Afficher une notification pour informer l'utilisateur
        alert('Votre réservation a été enregistrée avec succès dans notre système!');
        
        // Actualiser la page si on est sur la page de réservations
        if (window.location.pathname.includes('/admin/reservations') || 
            window.location.pathname.includes('/profile')) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la réservation Smoobu:', error);
        console.error('Détails de l\'erreur:', error.response?.data);
        
        // Afficher une notification d'erreur
        alert('Une erreur est survenue lors de l\'enregistrement de votre réservation. Veuillez contacter le support.');
      }
    } catch (generalError) {
      console.error('Erreur générale lors du traitement de la réservation Smoobu:', generalError);
    }
  };
  
  // Fonction pour mapper les statuts Smoobu aux statuts de l'application
  const mapSmoobuStatus = (smoobuStatus) => {
    if (!smoobuStatus) return 'en attente';
    
    const status = String(smoobuStatus).toLowerCase();
    
    if (status.includes('confirm') || status === 'booked' || status.includes('accept')) {
      return 'confirmée';
    } else if (status.includes('cancel') || status.includes('reject')) {
      return 'annulée';
    } else if (status.includes('complet') || status.includes('check') || status.includes('termin')) {
      return 'terminée';
    } else {
      return 'en attente';
    }
  };

  useEffect(() => {
    // Ajouter un script d'observation pour aider à capturer les événements de réservation Smoobu
    const script = document.createElement('script');
    script.innerHTML = `
      // Script pour surveiller les iframes Smoobu
      (function() {
        console.log("Initialisation de la surveillance Smoobu");
        
        // Observer les changements dans le DOM pour détecter les iframes Smoobu
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i];
                if (node.tagName === 'IFRAME' && node.src && node.src.includes('smoobu.com')) {
                  console.log("Iframe Smoobu détecté:", node.src);
                  
                  // Essayer d'accéder au contenu de l'iframe quand il est chargé
                  node.addEventListener('load', function() {
                    try {
                      const iframeWindow = node.contentWindow;
                      
                      // Écouter les événements de formulaire dans l'iframe
                      if (iframeWindow.document) {
                        const forms = iframeWindow.document.forms;
                        if (forms && forms.length > 0) {
                          for (let j = 0; j < forms.length; j++) {
                            forms[j].addEventListener('submit', function(e) {
                              console.log("Formulaire Smoobu soumis");
                              // Envoyer un message au parent
                              window.postMessage({
                                source: 'smoobu-widget',
                                type: 'reservation',
                                timestamp: new Date().toISOString()
                              }, '*');
                            });
                          }
                        }
                      }
                    } catch (e) {
                      console.error("Erreur d'accès à l'iframe:", e);
                    }
                  });
                }
              }
            }
          });
        });
        
        // Observer les changements dans le corps du document
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      })();
    `;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Fonction pour créer une réservation Smoobu de test
  const createTestReservation = async () => {
    if (!user) {
      console.error("Impossible de créer une réservation de test: utilisateur non connecté");
      return;
    }

    try {
      console.log("Tentative de création d'une réservation de test");
      
      // Récupérer d'abord un appartement pour obtenir son ID
      const appartementsResponse = await axios.get('http://localhost:5000/api/appartements', {
        withCredentials: true
      });
      
      if (!appartementsResponse.data || appartementsResponse.data.length === 0) {
        console.error("Aucun appartement trouvé pour créer une réservation de test");
        return;
      }
      
      // Prendre le premier appartement comme exemple
      const appartement = appartementsResponse.data[0];
      
      // Dates pour la réservation de test
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 7); // Une semaine plus tard
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 3); // 3 jours de séjour
      
      // Préparer l'objet de réservation
      const reservation = {
        userId: user.id,
        appartementId: appartement.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalPrice: appartement.prixParNuit ? appartement.prixParNuit * 3 : 300, // Prix pour 3 nuits
        status: 'confirmée',
        guestsCount: 2,
        smoobuReservationId: 'TEST-SMOOBU-' + Date.now() // ID unique pour identifier cette réservation de test
      };
      
      console.log("Données de la réservation de test:", reservation);
      
      // Envoyer la requête pour créer la réservation
      const response = await axios.post(
        'http://localhost:5000/api/reservations',
        reservation,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
          }
        }
      );
      
      console.log("Réservation de test créée avec succès:", response.data);
      alert("Réservation de test créée! Vérifiez la base de données.");
      
    } catch (error) {
      console.error("Erreur lors de la création de la réservation de test:", error);
      console.error("Détails:", error.response?.data);
      alert("Erreur lors de la création de la réservation de test. Vérifiez la console pour plus de détails.");
    }
  };

  // Exécuter cette fonction juste après le chargement du composant (si en mode debug)
  useEffect(() => {
    if (debugMode && user) {
      // Ajouter un bouton de debug sur la page
      const debugBtn = document.createElement('button');
      debugBtn.innerText = 'Créer une réservation Smoobu de test';
      debugBtn.style.position = 'fixed';
      debugBtn.style.right = '20px';
      debugBtn.style.bottom = '20px';
      debugBtn.style.zIndex = '9999';
      debugBtn.style.padding = '10px';
      debugBtn.style.backgroundColor = 'red';
      debugBtn.style.color = 'white';
      debugBtn.style.border = 'none';
      debugBtn.style.borderRadius = '5px';
      debugBtn.onclick = createTestReservation;
      
      document.body.appendChild(debugBtn);
      
      return () => {
        document.body.removeChild(debugBtn);
      };
    }
  }, [debugMode, user]);

  // Ce composant ne rend rien, il fonctionne uniquement en arrière-plan
  return null;
};

export default SmoobuCallbackHandler; 