import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import { FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";

const ReservationDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchReservationDetails = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`http://localhost:5000/api/reservations/${id}`, {
          withCredentials: true,
          headers
        });
        
        setReservation(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de la réservation:", error);
        setError("Impossible de récupérer les détails de la réservation. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [id, user, navigate]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.put(`http://localhost:5000/api/reservations/${id}/status`, 
        { status: newStatus },
        {
          withCredentials: true,
          headers
        }
      );
      
      setReservation(response.data.reservation);
      
      // Afficher un message de succès
      alert(`Statut mis à jour avec succès: ${newStatus}`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      alert("Erreur lors de la mise à jour du statut. Veuillez réessayer.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const calculateNights = () => {
    if (!reservation) return 0;
    
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention! </strong>
          <span className="block sm:inline">Réservation introuvable.</span>
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
      </div>
    );
  }

  const nights = calculateNights();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Détails de la réservation</h1>
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* En-tête avec statut */}
        <div className={`p-6 ${
          reservation.status === "confirmée" ? "bg-green-50" :
          reservation.status === "en attente" ? "bg-yellow-50" :
          reservation.status === "annulée" ? "bg-red-50" :
          "bg-blue-50"
        }`}>
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{reservation.appartement?.titre || "Appartement"}</h2>
              <p className="flex items-center text-gray-600 mb-1">
                <FaMapMarkerAlt className="mr-2" />
                {reservation.appartement?.localisation || "Adresse non spécifiée"}
              </p>
              <p className="flex items-center text-gray-600">
                <FaCalendarAlt className="mr-2" />
                Du {formatDate(reservation.startDate)} au {formatDate(reservation.endDate)} ({nights} nuit{nights > 1 ? 's' : ''})
              </p>
            </div>
            <div>
              <div className={`px-4 py-2 rounded-full font-medium text-center mb-2 ${
                reservation.status === "confirmée" ? "bg-green-100 text-green-800" :
                reservation.status === "en attente" ? "bg-yellow-100 text-yellow-800" :
                reservation.status === "annulée" ? "bg-red-100 text-red-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {reservation.status}
              </div>
              <p className="text-2xl font-bold text-blue-600 text-right">{reservation.totalPrice} €</p>
            </div>
          </div>
        </div>

        {/* Image de l'appartement */}
        {reservation.appartement?.images && reservation.appartement.images.length > 0 && (
          <div className="w-full h-64 overflow-hidden">
            <img 
              src={Array.isArray(reservation.appartement.images) 
                ? reservation.appartement.images[0]
                : typeof reservation.appartement.images === 'string'
                ? reservation.appartement.images
                : "https://via.placeholder.com/800x400"}
              alt={reservation.appartement.titre}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = "https://via.placeholder.com/800x400";
              }}
            />
          </div>
        )}

        {/* Détails de la réservation */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Récapitulatif</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Informations réservation</h4>
                <p className="text-gray-600">ID: {reservation.id}</p>
                <p className="text-gray-600">Date de réservation: {formatDate(reservation.createdAt)}</p>
                <p className="text-gray-600">Status: {reservation.status}</p>
              </div>
              
              <div className="border-b py-4">
                <h4 className="font-medium mb-2">Informations client</h4>
                <p className="text-gray-600">Nom: {reservation.user?.nom || "Non spécifié"}</p>
                <p className="text-gray-600">Email: {reservation.user?.email || "Non spécifié"}</p>
              </div>
            </div>
            
            <div>
              <div className="border-b pb-4">
                <h4 className="font-medium mb-2">Détails du paiement</h4>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Prix par nuit</span>
                  <span className="font-medium">{reservation.appartement?.prixParNuit || 0} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Nombre de nuits</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between font-bold mt-4">
                  <span>Total</span>
                  <span>{reservation.totalPrice} €</span>
                </div>
              </div>
              
              {/* Actions sur la réservation */}
              {(user.role === "admin" || reservation.userId === user.id) && reservation.status !== "annulée" && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {reservation.status === "en attente" && user.role === "admin" && (
                      <button 
                        onClick={() => updateStatus("confirmée")}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 inline-flex items-center"
                      >
                        <FaCheckCircle className="mr-2" /> 
                        {updatingStatus ? "En cours..." : "Confirmer la réservation"}
                      </button>
                    )}
                    
                    {(reservation.status === "en attente" || reservation.status === "confirmée") && (
                      <button 
                        onClick={() => {
                          if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
                            updateStatus("annulée");
                          }
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 inline-flex items-center"
                      >
                        <FaTimesCircle className="mr-2" />
                        {updatingStatus ? "En cours..." : "Annuler la réservation"}
                      </button>
                    )}
                    
                    {reservation.status === "confirmée" && user.role === "admin" && (
                      <button 
                        onClick={() => updateStatus("terminée")}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
                      >
                        <FaCheckCircle className="mr-2" />
                        {updatingStatus ? "En cours..." : "Marquer comme terminée"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetails; 