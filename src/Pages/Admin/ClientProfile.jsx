import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useMessages } from "../../Context/MessageContext";
import axios from "axios";
import { FaUser, FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaBirthdayCake, FaHistory, FaArrowLeft, FaExclamationTriangle, FaPaperPlane } from "react-icons/fa";

const ClientProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startConversationWithUser } = useMessages();
  
  const [clientData, setClientData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageSending, setMessageSending] = useState(false);
  const [messageError, setMessageError] = useState(null);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    console.log("Chargement du profil client avec ID:", userId);
    console.log("Type d'ID:", typeof userId);

    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Récupérer les informations du client
        // Note: Comme l'API n'existe peut-être pas encore, nous utilisons des données factices en cas d'erreur
        let clientInfo;
        try {
          // Essayer d'abord de récupérer l'utilisateur par son ID
          console.log("Tentative de récupération du client à l'URL:", `http://localhost:5000/users/${userId}`);
          const response = await axios.get(`http://localhost:5000/users/${userId}`, { withCredentials: true });
          clientInfo = response.data;
          console.log("Données client récupérées avec succès:", clientInfo);
        } catch (err) {
          console.warn("Impossible de récupérer les données réelles du client, utilisation de données factices", err);
          
          // Essayons de récupérer l'utilisateur depuis les réservations
          try {
            console.log("Tentative de récupération des réservations pour trouver les informations utilisateur");
            const allReservationsResponse = await axios.get("http://localhost:5000/reservations/all", { withCredentials: true });
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
          // Pour le backend existant : récupérer toutes les réservations et filtrer
          console.log("Récupération de toutes les réservations pour filtrer celles du client");
          const allReservationsResponse = await axios.get("http://localhost:5000/reservations/all", { withCredentials: true });
          console.log("Toutes les réservations:", allReservationsResponse.data.length);
          console.log("ID client recherché:", userId, "type:", typeof userId);
          
          // Filtrer les réservations pour n'obtenir que celles de l'utilisateur en question
          userReservations = allReservationsResponse.data.filter(res => {
            // Convertir explicitement en chaîne pour garantir la comparaison
            const reservationUserId = res.user?.id?.toString();
            const searchedUserId = userId.toString();
            
            console.log(`Comparaison: ${reservationUserId} (${typeof reservationUserId}) === ${searchedUserId} (${typeof searchedUserId}) => ${reservationUserId === searchedUserId}`);
            
            return reservationUserId === searchedUserId;
          });
          
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

  // Fonction pour extraire la première image d'un tableau d'images JSON
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

  // Fonction pour démarrer une conversation avec ce client
  const handleStartConversation = async () => {
    if (!user || user.role !== 'admin') {
      console.error("Seul l'administrateur peut démarrer une conversation");
      return;
    }
    
    setMessageSending(true);
    setMessageError(null);
    
    try {
      // Utiliser la fonction du contexte de messages pour démarrer une conversation
      await startConversationWithUser(userId, `Bonjour ${clientData.nom}, je suis l'administrateur. Comment puis-je vous aider ?`);
      console.log("Conversation démarrée avec succès");
      
      // Rediriger vers la page de messagerie
      navigate('/messages');
    } catch (error) {
      console.error("Erreur lors du démarrage de la conversation:", error);
      setMessageError("Impossible de démarrer la conversation. Veuillez réessayer.");
    } finally {
      setMessageSending(false);
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
            </ul>
            <p className="text-sm mt-1">
              Actuellement, des données fictives peuvent être affichées si ces API ne sont pas disponibles.
            </p>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-4">
                <FaUser size={64} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{clientData.nom}</h2>
              <p className="text-sm text-gray-500">Client depuis {formatDate(clientData.createdAt)}</p>
              
              <div className="mt-4 flex space-x-2">
                <button 
                  onClick={handleStartConversation}
                  disabled={messageSending}
                  className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors flex items-center"
                >
                  {messageSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Envoyer un message
                    </>
                  )}
                </button>
              </div>
              
              {messageError && (
                <div className="mt-2 text-sm text-red-500">
                  {messageError}
                </div>
              )}
            </div>
            
            <div className="md:w-2/3 md:pl-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="text-rose-500 mt-1 mr-3">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{clientData.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-rose-500 mt-1 mr-3">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-gray-900">{clientData.telephone || "Non renseigné"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-rose-500 mt-1 mr-3">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="text-gray-900">{clientData.adresse || "Non renseignée"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-rose-500 mt-1 mr-3">
                    <FaBirthdayCake />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date de naissance</p>
                    <p className="text-gray-900">{clientData.dateNaissance ? formatDate(clientData.dateNaissance) : "Non renseignée"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-rose-500 mt-1 mr-3">
                    <FaCreditCard />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Méthode de paiement</p>
                    <p className="text-gray-900">{clientData.methodePaiement || "Non renseignée"}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="text-rose-500 mt-1 mr-3">
                    <FaHistory />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Réservations totales</p>
                    <p className="text-gray-900">{reservations.length}</p>
                  </div>
                </div>
              </div>
              
              {clientData.preferences && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Préférences</h4>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-md">{clientData.preferences}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Historique des réservations */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Historique des réservations</h2>
        
        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            Aucune réservation trouvée pour ce client
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réservation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appartement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voyageurs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                        <div className="text-sm text-gray-500">
                          Créée le {formatDate(reservation.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={getFirstImage(reservation.appartement?.images)}
                              alt={reservation.appartement?.titre}
                            />
                          </div>
                          <div>
                            <div className="text-sm text-gray-900">{reservation.appartement?.titre || "Appartement inconnu"}</div>
                            <div className="text-xs text-gray-500">{reservation.appartement?.localisation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24)) || 1} nuits
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {reservation.guestsCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {reservation.totalPrice}€
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile; 