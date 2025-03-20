import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaParking, FaWifi, FaBath, FaBed, FaUser } from "react-icons/fa";
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
      return JSON.parse(str);
    } catch {
      return str;
    }
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

  const handleReservation = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    if (!selectedDates || !selectedDates[0] || !selectedDates[1]) {
      setError("Veuillez sélectionner des dates");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const reservationData = {
        appartementId: appartement.id,
        startDate: selectedDates[0],
        endDate: selectedDates[1],
        totalPrice: totalPrice
      };
  
      console.log("Données envoyées pour la réservation :", reservationData); // 🔥 Debug
  
      await axios.post("http://localhost:5000/reservations", reservationData, {
        withCredentials: true
      });
  
      navigate("/profile"); // 🔥 Redirige après succès
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      setError("Une erreur est survenue lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {appartement ? (
        <>
          <h1 className="text-3xl font-bold mb-4">{appartement.titre}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>{appartement.note} ({appartement.nombreAvis} avis)</span>
            </div>
            <span>•</span>
            <span>{appartement.localisation}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img 
                src={parseJSON(appartement.images)[0]} 
                alt={appartement.titre}
                className="w-full h-96 object-cover rounded-xl"
              />
              
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">
                  Logement proposé par {parseJSON(appartement.hote).nom}
                </h2>
                <div className="flex gap-4 text-gray-600">
                  <div>
                    <FaUser className="inline mr-2" />
                    {parseJSON(appartement.capacite).voyageurs} voyageurs
                  </div>
                  <div>
                    <FaBed className="inline mr-2" />
                    {parseJSON(appartement.capacite).chambres} chambre
                  </div>
                  <div>
                    <FaBath className="inline mr-2" />
                    {parseJSON(appartement.capacite).sallesDeBain} salle de bain
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
                  {parseJSON(appartement.inclus).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item === "Wifi" && <FaWifi />}
                      {item === "Parking gratuit" && <FaParking />}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
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
                {loading ? 'Réservation en cours...' : 'Réserver'}
              </button>

              <div className="mt-4 text-center text-gray-500">
                Aucun montant ne vous sera débité pour le moment
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
