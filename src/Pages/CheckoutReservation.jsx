import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { FaStar, FaArrowLeft, FaShieldAlt, FaCreditCard, FaApplePay, FaPaypal, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CheckoutReservation = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appartement, setAppartement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  
  // États pour les modifications
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const [datesBloquees, setDatesBloquees] = useState([]);
  const [guestsCount, setGuestsCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Informations de la carte
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Récupérer les détails de la réservation depuis l'état de location
    if (location.state && location.state.reservationDetails) {
      const details = location.state.reservationDetails;
      setReservationDetails(details);
      setSelectedDates([new Date(details.startDate), new Date(details.endDate)]);
      setTotalPrice(details.totalPrice);
      
      // Extraire le nombre de voyageurs s'il est disponible
      if (details.guestsCount) {
        setGuestsCount(details.guestsCount);
      }
    } else {
      navigate(`/appartement/${slug}`);
      return;
    }

    const fetchAppartementData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/appartements/slug/${slug}`);
        setAppartement(response.data);
        
        // Récupérer les dates bloquées
        const resDispo = await axios.get(`http://localhost:5000/api/appartements/disponibilites/${response.data.id}`);
        setDatesBloquees(resDispo.data.map(d => new Date(d.date)));
      } catch (error) {
        console.error("Erreur lors du chargement des données de l'appartement", error);
        setError("Impossible de charger les informations de l'appartement");
      } finally {
        setLoading(false);
      }
    };

    fetchAppartementData();
  }, [user, slug, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardInfo({ ...cardInfo, [name]: value });
  };

  const formatCardNumber = (value) => {
    // Formatage du numéro de carte (ajoute des espaces tous les 4 chiffres)
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    // Formatage de la date d'expiration (MM/YY)
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length <= 2) {
      return v;
    }
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardInfo({ ...cardInfo, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e) => {
    const formattedValue = formatExpiry(e.target.value);
    setCardInfo({ ...cardInfo, expiry: formattedValue });
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

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    const options = { day: 'numeric', month: 'long' };
    const formattedStartDate = new Date(startDate).toLocaleDateString('fr-FR', options);
    const formattedEndDate = new Date(endDate).toLocaleDateString('fr-FR', options);
    return `${formattedStartDate} - ${formattedEndDate}`;
  };

  const calculateNights = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Fonction pour gérer le changement de dates
  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    if (dates && dates[0] && dates[1] && appartement) {
      const diffTime = Math.abs(dates[1] - dates[0]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const newTotal = diffDays * appartement.prixParNuit;
      setTotalPrice(newTotal);
      
      // Mettre à jour les détails de la réservation
      setReservationDetails({
        ...reservationDetails,
        startDate: dates[0],
        endDate: dates[1],
        totalPrice: newTotal
      });
    }
  };

  // Fonction pour vérifier si une date est désactivée
  const isDateDisabled = (date) => {
    return datesBloquees.some(d => d.toDateString() === date.toDateString());
  };

  // Fonction pour gérer le changement du nombre de voyageurs
  const handleGuestsChange = (count) => {
    setGuestsCount(count);
    setReservationDetails({
      ...reservationDetails,
      guestsCount: count
    });
  };

  // Fonction pour fermer les pickers
  const handleClosePickers = () => {
    setShowDatePicker(false);
    setShowGuestsPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reservationDetails) {
      setError("Détails de réservation manquants");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // En environnement de test, nous simulons la réservation sans traitement de paiement réel
      const reservationData = {
        appartementId: appartement.id,
        startDate: reservationDetails.startDate,
        endDate: reservationDetails.endDate,
        totalPrice: reservationDetails.totalPrice,
        guestsCount: guestsCount,
        paymentMethod: activePaymentMethod,
        // Dans un environnement de production, ne JAMAIS envoyer les informations complètes 
        // de carte de crédit au backend. Utilisez un token sécurisé de Stripe à la place.
        paymentCompleted: true // Simulons que le paiement est complété
      };
      
      // Envoyer les données de réservation au backend
      await axios.post("http://localhost:5000/reservations", reservationData, {
        withCredentials: true
      });
      
      // Afficher la confirmation
      setConfirmation(true);
      
      // Rediriger vers la page de profil après un délai
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
      
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      setError("Une erreur est survenue lors du traitement de votre réservation. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Réservation confirmée !</h1>
          <p className="text-gray-600 mb-6">
            Votre réservation a été enregistrée avec succès. Vous allez être redirigé vers votre profil.
          </p>
          <Link to="/profile" className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium">
            Voir mes réservations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to={`/appartement/${slug}`} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FaArrowLeft className="mr-2" />
        Retour à l'appartement
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
          {error}
        </div>
      )}

      {appartement && reservationDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de paiement et checkout */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-6">Réserver votre séjour</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Votre voyage</h2>
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Dates</h3>
                    <p className="text-gray-600">{formatDateRange(reservationDetails.startDate, reservationDetails.endDate)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowDatePicker(!showDatePicker);
                      setShowGuestsPicker(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Modifier
                  </button>
                </div>
                
                {/* Sélecteur de dates */}
                {showDatePicker && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50 relative">
                    <button 
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowDatePicker(false)}
                    >
                      <FaTimes />
                    </button>
                    <h3 className="font-medium mb-3">Modifier vos dates</h3>
                    <div className="flex justify-center">
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
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => setShowDatePicker(false)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Voyageurs</h3>
                    <p className="text-gray-600">{guestsCount} voyageur{guestsCount > 1 ? 's' : ''}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowGuestsPicker(!showGuestsPicker);
                      setShowDatePicker(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Modifier
                  </button>
                </div>
                
                {/* Sélecteur de voyageurs */}
                {showGuestsPicker && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50 relative">
                    <button 
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowGuestsPicker(false)}
                    >
                      <FaTimes />
                    </button>
                    <h3 className="font-medium mb-3">Nombre de voyageurs</h3>
                    <div className="flex items-center justify-between my-2">
                      <span>Voyageurs</span>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleGuestsChange(Math.max(1, guestsCount - 1))}
                          className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:border-gray-400"
                          disabled={guestsCount <= 1}
                        >
                          -
                        </button>
                        <span className="mx-4">{guestsCount}</span>
                        <button 
                          onClick={() => handleGuestsChange(Math.min(10, guestsCount + 1))}
                          className="w-8 h-8 flex items-center justify-center border rounded-full text-gray-600 hover:border-gray-400"
                          disabled={guestsCount >= 10}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => setShowGuestsPicker(false)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Payer avec</h2>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <button 
                  className={`flex items-center justify-center px-4 py-3 border rounded-md w-full md:w-auto ${activePaymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setActivePaymentMethod('card')}
                >
                  <FaCreditCard className="mr-2" />
                  <span>Carte bancaire</span>
                </button>
                
                <button 
                  className={`flex items-center justify-center px-4 py-3 border rounded-md w-full md:w-auto ${activePaymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setActivePaymentMethod('paypal')}
                >
                  <FaPaypal className="mr-2" />
                  <span>PayPal</span>
                </button>
                
                <button 
                  className={`flex items-center justify-center px-4 py-3 border rounded-md w-full md:w-auto ${activePaymentMethod === 'applepay' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setActivePaymentMethod('applepay')}
                >
                  <FaApplePay className="mr-2" />
                  <span>Apple Pay</span>
                </button>
              </div>
              
              {activePaymentMethod === 'card' && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-gray-700 mb-2">Numéro de carte</label>
                    <input 
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="cardName" className="block text-gray-700 mb-2">Nom sur la carte</label>
                    <input 
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={cardInfo.cardName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      placeholder="Admin"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="expiry" className="block text-gray-700 mb-2">Date d'expiration</label>
                      <input 
                        type="text"
                        id="expiry"
                        name="expiry"
                        value={cardInfo.expiry}
                        onChange={handleExpiryChange}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvc" className="block text-gray-700 mb-2">Code de sécurité</label>
                      <input 
                        type="text"
                        id="cvc"
                        name="cvc"
                        value={cardInfo.cvc}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <FaShieldAlt className="text-blue-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-blue-800">
                          Un acompte de 500€ sera prélevé lors de la réservation. Ce montant sera déduit du prix total de votre séjour.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg mt-4 font-semibold transition ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Traitement en cours...' : 'Réserver maintenant'}
                  </button>
                </form>
              )}
              
              {activePaymentMethod === 'paypal' && (
                <div className="text-center py-6">
                  <p className="mb-4">Vous allez être redirigé vers PayPal pour finaliser votre paiement</p>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Traitement en cours...' : 'Payer avec PayPal'}
                  </button>
                </div>
              )}
              
              {activePaymentMethod === 'applepay' && (
                <div className="text-center py-6">
                  <p className="mb-4">Continuez avec Apple Pay pour finaliser votre paiement</p>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Traitement en cours...' : 'Payer avec Apple Pay'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Politique d'annulation</h2>
              <p className="text-gray-600 mb-2">
                Annulation gratuite jusqu'à 48 heures avant votre arrivée. Ensuite, l'acompte n'est pas remboursable.
              </p>
              <p className="text-gray-600">
                Notre politique de protection contre la COVID-19 ne s'applique pas à cette réservation.
              </p>
            </div>
          </div>
          
          {/* Résumé de la réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-start mb-6">
                <img 
                  src={Array.isArray(parseJSON(appartement.images)) && parseJSON(appartement.images).length > 0
                    ? parseJSON(appartement.images)[0]
                    : "https://via.placeholder.com/600x400?text=Aucune+image+disponible"} 
                  alt={appartement.titre}
                  className="w-24 h-24 object-cover rounded-lg mr-4" 
                />
                <div>
                  <h3 className="font-semibold">{appartement.titre}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span>{appartement.note}</span>
                    <span className="mx-1">•</span>
                    <span>{appartement.nombreAvis} avis</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-b py-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Détails des prix</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>{appartement.prixParNuit}€ x {calculateNights(reservationDetails.startDate, reservationDetails.endDate)} nuits</span>
                    <span>{totalPrice}€</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Frais de service</span>
                    <span>Inclus</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Acompte à verser maintenant</span>
                    <span>500€</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{totalPrice}€</span>
              </div>
              
              <div className="text-sm text-gray-500 mt-4">
                <p>Vous ne paierez que 500€ aujourd'hui. Le reste ({totalPrice - 500}€) sera débité automatiquement le jour de votre arrivée.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutReservation; 