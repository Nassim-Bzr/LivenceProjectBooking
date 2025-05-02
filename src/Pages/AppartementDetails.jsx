import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaParking, FaWifi, FaBath, FaBed, FaUser, FaChevronRight, FaImage, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import { API_URL } from '../config/api';

const AppartementDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appartement, setAppartement] = useState(null);
  const [datesBloquees, setDatesBloquees] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showSmoobuBooking, setShowSmoobuBooking] = useState(false);
  const [showDirectBooking, setShowDirectBooking] = useState(false);
  const [guestsCount, setGuestsCount] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAppart = await axios.get(`${API_URL}/appartements/slug/${slug}`);
        console.log("Données reçues de l'API:", resAppart.data);
        setAppartement(resAppart.data);
        setImageError(false);
    
        const resDispo = await axios.get(`${API_URL}/appartements/disponibilites/${resAppart.data.id}`);
        const dates = resDispo.data.map(d => {
          const date = new Date(d.date);
          return isNaN(date.getTime()) ? null : date;
        }).filter(date => date !== null);
        setDatesBloquees(dates);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
        setError("Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, [slug]);

  const parseJSON = (str) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch (error) {
      console.error("Erreur de parsing JSON:", error);
      return null;
    }
  };

  const getImages = (imagesStr) => {
    if (!imagesStr) return [];
    
    // Cas particulier pour les images
    if (typeof imagesStr === 'string') {
      // Approche directe pour extraire l'URL de l'image
      const urlPattern = /https:\/\/[^"\\]+/g;
      const matches = imagesStr.match(urlPattern);
      if (matches && matches.length > 0) {
        console.log("URLs extraites:", matches);
        return matches;
      }
      
      // Si l'extraction d'URL a échoué, essayons de nettoyer et parser
      try {
        // Enlever tous les backslashes
        let cleaned = imagesStr.replace(/\\/g, '');
        // Enlever les guillemets au début et à la fin
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.log("Échec du nettoyage et parsing:", e);
      }
    }
    
    // En cas d'échec, on essaie simplement de parser
    const parsed = parseJSON(imagesStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    return [];
  };

  const isDateDisabled = (date) => {
    if (!Array.isArray(datesBloquees)) return false;
    return datesBloquees.some(blockedDate => {
      if (!(blockedDate instanceof Date)) return false;
      if (!(date instanceof Date)) return false;
      return blockedDate.toDateString() === date.toDateString();
    });
  };

  const getCapaciteValue = (key, defaultValue = 0) => {
    if (!appartement?.capacite) return defaultValue;
    const capacite = parseJSON(appartement.capacite);
    return (capacite && typeof capacite === 'object' && capacite[key] !== undefined) 
      ? capacite[key] 
      : defaultValue;
  };

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    if (dates && dates[0] && dates[1] && appartement) {
      const diffTime = Math.abs(dates[1] - dates[0]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalPrice(diffDays * appartement.prixParNuit);
    }
  };

  const formatDateRange = (dates) => {
    if (!dates || !dates[0] || !dates[1]) return "";
    const options = { day: 'numeric', month: 'long' };
    const startDate = dates[0].toLocaleDateString('fr-FR', options);
    const endDate = dates[1].toLocaleDateString('fr-FR', options);
    return `du ${startDate} au ${endDate}`;
  };

  // Fonction pour réserver directement sur notre plateforme
  const handleDirectReservation = async () => {
    if (!user) {
      navigate("/login", { 
        state: { 
          redirectUrl: `/appartement/${slug}`,
          message: "Connectez-vous pour effectuer votre réservation" 
        } 
      });
      return;
    }
  
    if (!selectedDates || !selectedDates[0] || !selectedDates[1]) {
      setError("Veuillez sélectionner des dates pour votre séjour");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Créer l'objet réservation
      const reservationData = {
        appartementId: appartement.id,
        startDate: selectedDates[0].toISOString().split('T')[0],
        endDate: selectedDates[1].toISOString().split('T')[0],
        totalPrice: totalPrice,
        guestsCount: guestsCount
      };
      
      console.log("Données de réservation:", reservationData);
      
      // Envoyer la demande de réservation
      const response = await axios.post(
        `${API_URL}/reservations`,
        reservationData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Réponse de réservation:", response.data);
      
      // Afficher un message de succès
      setSuccessMessage("Votre réservation a été effectuée avec succès !");
      
      // Réinitialiser le formulaire
      setSelectedDates(null);
      
      // Rediriger vers la page de confirmation
      setTimeout(() => {
        navigate("/profile", { 
          state: { 
            message: "Votre réservation a été enregistrée avec succès",
            reservationId: response.data.reservation.id
          } 
        });
      }, 2000);
      
    } catch (err) {
      console.error("Erreur lors de la réservation:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Erreur lors de la réservation");
      } else {
        setError("Erreur de connexion au serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={i < rating ? "text-yellow-400" : "text-gray-300"} 
      />
    ));
  };

  // Fonction pour intégrer le widget Smoobu
  const getSmoobuWidget = () => {
    // Vérifier si l'appartement a un ID Smoobu
    if (!appartement || !appartement.smoobuId) return null;
    
    const divId = `apartmentIframe${appartement.smoobuId}`;
    // Utiliser l'ID d'hôte stocké dans l'appartement ou l'ID par défaut
    const hosteId = appartement.smoobuHosteId || '1134658';
    
    // Retourner le widget sous forme de JSX
    return (
      <div id={divId}>
        <div dangerouslySetInnerHTML={{
          __html: `
            <script type="text/javascript" src="https://login.smoobu.com/js/Settings/BookingToolIframe.js"></script>
            <script>
              BookingToolIframe.initialize({
                "url": "https://login.smoobu.com/fr/booking-tool/iframe/${hosteId}/${appartement.smoobuId}", 
                "baseUrl": "https://login.smoobu.com", 
                "target": "#${divId}"
              })
            </script>
          `
        }} />
      </div>
    );
  };

  // Ajouter un script externe dans le DOM
  useEffect(() => {
    if (showSmoobuBooking && appartement) {
      // Log détaillé pour le debug
      console.log("Tentative d'initialisation du widget Smoobu:", {
        smoobuId: appartement.smoobuId,
        slug: appartement.slug,
        titre: appartement.titre
      });
      
      const script = document.createElement('script');
      script.src = 'https://login.smoobu.com/js/Settings/BookingToolIframe.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        // Une fois le script chargé, initialiser le widget
        const divId = `apartmentIframe${appartement.smoobuId}`;
        // Utiliser l'ID d'hôte stocké dans l'appartement ou l'ID par défaut
        const hosteId = appartement.smoobuHosteId || '1134658';
        
        console.log(`Initialisation avec hosteId: ${hosteId} et appartementId: ${appartement.smoobuId}`);
        
        if (window.BookingToolIframe && document.getElementById(divId)) {
          window.BookingToolIframe.initialize({
            "url": `https://login.smoobu.com/fr/booking-tool/iframe/${hosteId}/${appartement.smoobuId}`, 
            "baseUrl": "https://login.smoobu.com", 
            "target": `#${divId}`
          });
        } else {
          console.error("Échec d'initialisation - BookingToolIframe ou divId non trouvé");
        }
      };
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showSmoobuBooking, appartement]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {appartement ? (
        <>
          <h1 className="text-3xl font-bold mb-4">{appartement.titre}</h1>
          
          {/* Afficher les messages de succès/erreur */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
              <FaCheckCircle className="mr-2" />
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
              <FaTimesCircle className="mr-2" />
              {typeof error === 'object' && error.message ? error.message : error}
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-6">
            <Link to={`/appartement/${slug}/avis`} className="flex items-center hover:text-blue-600 transition-colors">
              <div className="flex items-center">
                {renderStars(appartement.note)}
                <span className="ml-1">{appartement.note}</span>
              </div>
              <span className="mx-1">•</span>
              <span>{appartement.nombreAvis} avis</span>
              <FaChevronRight className="ml-1" />
            </Link>
            <span>•</span>
            <span>{appartement.localisation}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Image principale */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={getImages(appartement.images)[0] || 'https://via.placeholder.com/300x200?text=Image+non+disponible'}
                  alt={appartement.titre}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                  }}
                />
              </div>

              {/* Galerie d'images miniatures */}
              {getImages(appartement.images).length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {getImages(appartement.images).slice(1, 5).map((img, index) => (
                    <div key={index} className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                      <img
                        src={img}
                        alt={`${appartement.titre} - ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Logement proposé par l'administrateur
                </h2>
                <div className="flex gap-4 text-gray-600">
                  <div>
                    <FaUser className="inline mr-2" />
                    {getCapaciteValue('voyageurs', 1)} voyageurs
                  </div>
                  <div>
                    <FaBed className="inline mr-2" />
                    {getCapaciteValue('chambres', 1)} chambre{getCapaciteValue('chambres', 1) > 1 ? 's' : ''}
                  </div>
                  <div>
                    <FaBath className="inline mr-2" />
                    {getCapaciteValue('sallesDeBain', 1)} salle de bain{getCapaciteValue('sallesDeBain', 1) > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Description</h3>
                <p className="text-gray-600">{appartement.description}</p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Ce que propose ce logement</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(parseJSON(appartement.inclus)) 
                    ? parseJSON(appartement.inclus).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {item === "Wifi" && <FaWifi />}
                          {item === "Parking gratuit" && <FaParking />}
                          <span>{item}</span>
                        </div>
                      ))
                    : <div>Aucun équipement spécifié</div>
                  }
                </div>
              </div>
              
              <div className="mt-8 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Avis</h3>
                  <Link 
                    to={`/appartement/${slug}/avis`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Voir tous les avis ({appartement.nombreAvis})
                    <FaChevronRight className="ml-1" />
                  </Link>
                </div>
                
                <div className="flex items-center mt-2 mb-4">
                  <div className="flex mr-2">
                    {renderStars(appartement.note)}
                  </div>
                  <span className="font-medium">{appartement.note.toFixed(1)}</span>
                  <span className="mx-2">•</span>
                  <span>{appartement.nombreAvis} avis</span>
                </div>
                
                <Link 
                  to={`/appartement/${slug}/avis`}
                  className="block w-full mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-center hover:bg-gray-50"
                >
                  Voir tous les commentaires
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border sticky top-4 h-fit">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold">{appartement.prixParNuit}€ <span className="text-base font-normal">/ nuit</span></span>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span>{appartement.note}</span>
                </div>
              </div>

              {/* Boutons de réservation */}
      
                
                <button
                  onClick={() => {
                    setShowSmoobuBooking(!showSmoobuBooking);
                    if (showDirectBooking) setShowDirectBooking(false);
                  }}
                  className="bg-white border border-rose-600 text-rose-600 py-3 px-6 rounded-lg font-medium hover:bg-rose-50 transition-colors w-full"
                >
                  {showSmoobuBooking ? "Masquer" : "Réserver"}
                </button>
              </div>
              
              {/* Interface de réservation directe */}
              {showDirectBooking && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Réserver directement</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dates de séjour
                    </label>
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDates}
                      selectRange={true}
                      minDate={new Date()}
                      tileDisabled={({ date }) => isDateDisabled(date)}
                      className="w-full rounded border"
                    />
                  </div>
                  
                  {selectedDates && selectedDates[0] && selectedDates[1] && (
                    <div className="my-4 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">Séjour {formatDateRange(selectedDates)}</p>
                      <p className="text-gray-600">
                        {Math.ceil((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24))} nuits
                      </p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de voyageurs
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full p-2 border rounded-lg"
                    >
                      {[...Array(getCapaciteValue('voyageurs', 4))].map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {idx + 1} voyageur{idx > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedDates && selectedDates[0] && selectedDates[1] && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between mb-2">
                        <span>Prix total</span>
                        <span className="font-bold">{totalPrice}€</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleDirectReservation}
                    disabled={loading || !selectedDates || !selectedDates[0] || !selectedDates[1]}
                    className="w-full mt-4 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
                  >
                    {loading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : null}
                    {loading ? "Réservation en cours..." : "Réserver maintenant"}
                  </button>
                </div>
              )}
              
              {/* Interface de réservation Smoobu */}
              {showSmoobuBooking && (
                <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Réservation via Smoobu</h3>
                  <div id={`apartmentIframe${appartement.smoobuId}`} className="w-full min-h-[500px]">
                    <div className="flex justify-center items-center h-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      )}
    </div>
  );
};

export default AppartementDetails;
