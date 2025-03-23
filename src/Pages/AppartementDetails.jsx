import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaParking, FaWifi, FaBath, FaBed, FaUser, FaChevronRight, FaEnvelope } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import { useMessages } from "../Context/MessageContext";

const AppartementDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startConversationWithAdmin } = useMessages();
  const [appartement, setAppartement] = useState(null);
  const [datesBloquees, setDatesBloquees] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAppart = await axios.get(`http://localhost:5000/api/appartements/slug/${slug}`);
        setAppartement(resAppart.data);
    
        const resDispo = await axios.get(`http://localhost:5000/api/appartements/disponibilites/${resAppart.data.id}`);
        setDatesBloquees(resDispo.data.map(d => new Date(d.date)));
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
        setError("Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, [slug]);

  const isDateDisabled = (date) => {
    return datesBloquees.some(d => d.toDateString() === date.toDateString());
  };

  const parseJSON = (str) => {
    try {
      const parsed = JSON.parse(str);
      return parsed;
    } catch (e) {
      // Si JSON.parse échoue, retourner la valeur d'origine ou un objet/tableau vide selon le contexte
      return typeof str === 'string' ? str : {};
    }
  };

  const getCapaciteValue = (key, defaultValue = 0) => {
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

  const handleReservation = () => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    if (!selectedDates || !selectedDates[0] || !selectedDates[1]) {
      setError("Veuillez sélectionner des dates");
      return;
    }
    
    // Création de l'objet avec les détails de la réservation
    const reservationDetails = {
      appartementId: appartement.id,
      startDate: selectedDates[0],
      endDate: selectedDates[1],
      totalPrice: totalPrice,
      guestsCount: 1 // Valeur par défaut pour le nombre de voyageurs
    };
    
    // Redirection vers la page de checkout avec les détails de la réservation
    navigate(`/appartement/${slug}/checkout`, { 
      state: { reservationDetails } 
    });
  };

  const handleContactHost = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const messageContent = `Bonjour, je suis intéressé(e) par votre logement "${appartement.titre}". Pourriez-vous me recontacter s'il vous plaît ?`;
      
      await startConversationWithAdmin(messageContent);
      
      // Rediriger vers la page de messagerie
      navigate("/messages");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError("Impossible d'envoyer le message pour le moment. Veuillez réessayer plus tard.");
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {appartement ? (
        <>
          <h1 className="text-3xl font-bold mb-4">{appartement.titre}</h1>
          
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
              <img 
                src={Array.isArray(parseJSON(appartement.images)) && parseJSON(appartement.images).length > 0
                  ? parseJSON(appartement.images)[0]
                  : "https://via.placeholder.com/600x400?text=Aucune+image+disponible"}
                alt={appartement.titre}
                className="w-full h-96 object-cover rounded-xl"
              />
              
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
                <button
                  onClick={handleContactHost}
                  className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FaEnvelope />
                  Contacter l'hôte
                </button>
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

              <div className="flex justify-center mb-4">
                <Calendar
                  selectRange={true}
                  onChange={handleDateChange}
                  value={selectedDates}
                  tileDisabled={({ date }) => isDateDisabled(date)}
                  className="rounded-lg border p-4 w-full max-w-md [&_.react-calendar__tile--active]:!bg-rose-500 [&_.react-calendar__tile--active]:!text-white [&_.react-calendar__tile--now]:!bg-white [&_.react-calendar__tile--now]:!text-black [&_.react-calendar__tile--hasActive]:!bg-rose-200 [&_.react-calendar__tile:enabled:hover]:!bg-rose-100 [&_.react-calendar__tile:enabled:focus]:!bg-rose-100"
                  minDate={new Date()}
                  tileClassName={({ date }) => 
                    isDateDisabled(date) ? 'line-through bg-gray-50 text-gray-300 cursor-not-allowed hover:bg-gray-50 !important' : null
                  }
                />
              </div>

              {selectedDates && (
                <div className="mb-4 text-center">
                  <p className="font-medium">Séjour sélectionné {formatDateRange(selectedDates)}</p>
                  <p className="text-lg font-bold mt-2">
                    Total: {totalPrice}€ pour {Math.ceil(Math.abs(selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24))} nuits
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-center mb-4">
                  {error}
                </div>
              )}

              <button 
                onClick={handleReservation}
                disabled={loading || !selectedDates}
                className={`w-full py-3 rounded-lg mt-6 transition ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {loading ? 'Traitement en cours...' : 'Réserver'}
              </button>

              <div className="mt-4 text-center text-gray-500">
                <p>Un acompte de 500€ sera prélevé lors de la réservation.</p>
                <p className="text-xs mt-1">Le reste du montant sera prélevé le jour de votre arrivée.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      )}
    </div>
  );
};

export default AppartementDetails;
