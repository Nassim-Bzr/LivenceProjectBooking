import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaStar, FaParking, FaWifi, FaBath, FaBed, FaUser, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAppart = await axios.get(`http://localhost:5000/api/appartements/slug/${slug}`);
        setAppartement(resAppart.data);
    
        const resDispo = await axios.get(`http://localhost:5000/api/appartements/disponibilites/${resAppart.data.id}`);
        // Convert dates to Date objects when setting them
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

  const isDateDisabled = (date) => {
    if (!Array.isArray(datesBloquees)) return false;
    return datesBloquees.some(blockedDate => {
      if (!(blockedDate instanceof Date)) return false;
      if (!(date instanceof Date)) return false;
      return blockedDate.toDateString() === date.toDateString();
    });
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
                  onChange={handleDateChange}
                  value={selectedDates}
                  minDate={new Date()}
                  tileDisabled={isDateDisabled}
                  selectRange={true}
                  className="rounded-lg border-none"
                />
              </div>

              {selectedDates && selectedDates[0] && selectedDates[1] && (
                <div className="mb-4">
                  <p className="text-gray-600">
                    {formatDateRange(selectedDates)}
                  </p>
                  <p className="text-lg font-semibold mt-2">
                    Total: {totalPrice}€
                  </p>
                </div>
              )}

              <button
                onClick={handleReservation}
                className="w-full bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Réserver
              </button>
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
