import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaSearch, FaUser, FaExternalLinkAlt } from "react-icons/fa";

const AdminReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingReservation, setEditingReservation] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [appartements, setAppartements] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  // Charger les réservations
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        // Utiliser l'URL correcte pour récupérer toutes les réservations en tant qu'admin
        const response = await axios.get(
          "http://localhost:5000/api/reservations/all",
          { withCredentials: true }
        );
        
        console.log("Réservations chargées:", response.data.length);
        // Debug: Afficher la structure complète des données de réservation
        console.log("Structure d'une réservation:", response.data[0]);
        console.log("Utilisateur associé:", response.data[0]?.user);
        console.log("ID utilisateur:", response.data[0]?.user?.id);
        console.log("Tous les IDs utilisateurs:", response.data.map(r => r.user?.id));
        
        // Les données sont directement dans la réponse
        setReservations(response.data);
        setTotalPages(1); // Si la pagination n'est pas implémentée côté serveur
        
        // Pas besoin de récupérer les appartements séparément car ils sont inclus dans la réponse
      } catch (err) {
        console.error("Erreur lors du chargement des réservations:", err);
        
        // Si l'endpoint /reservations/all n'existe pas encore, fallback sur /reservations/user
        try {
          console.log("Tentative de récupération avec l'endpoint de fallback...");
          const fallbackResponse = await axios.get(
            "http://localhost:5000/api/reservations/user",
            { withCredentials: true }
          );
          
          console.log("Réservations récupérées via fallback:", fallbackResponse.data.length);
          setReservations(fallbackResponse.data);
        } catch (fallbackErr) {
          console.error("Erreur lors du chargement des réservations (fallback):", fallbackErr);
          setError("Impossible de charger les réservations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [statusFilter, searchTerm]); // Retirer page car nous n'utilisons pas de pagination côté serveur

  // Fonction pour mettre à jour le statut d'une réservation
  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      console.log("Mise à jour de la réservation:", reservationId, "avec statut:", newStatus);
      
      // S'assurer que le statut correspond exactement à l'une des valeurs attendues par le backend
      if (!["en attente", "confirmée", "annulée", "terminée"].includes(newStatus)) {
        throw new Error(`Statut invalide: ${newStatus}. Les valeurs valides sont: "en attente", "confirmée", "annulée", "terminée"`);
      }
      
      const requestData = { status: newStatus };
      
      const response = await axios.put(
        `http://localhost:5000/api/reservations/${reservationId}/status`,
        requestData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Réponse du serveur:", response.data);
      
      // Mettre à jour l'état local
      setReservations(
        reservations.map(reservation =>
          reservation.id === reservationId
            ? { ...reservation, status: newStatus }
            : reservation
        )
      );
      
      // Si on était en train d'éditer cette réservation, fermer le mode édition
      if (editingReservation && editingReservation.id === reservationId) {
        setEditingReservation(null);
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      
      // Afficher plus de détails sur l'erreur
      if (err.response) {
        console.error("Détails de l'erreur:", err.response.data);
        setError(`Impossible de mettre à jour le statut: ${JSON.stringify(err.response.data)}`);
      } else {
        setError(err.message || "Impossible de mettre à jour le statut de la réservation");
      }
    }
  };

  // Fonction pour supprimer une réservation
  const deleteReservation = async (reservationId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      return;
    }
    
    try {
      await axios.delete(
        `http://localhost:5000/api/reservations/${reservationId}`,
        { withCredentials: true }
      );
      
      // Mettre à jour l'état local
      setReservations(reservations.filter(reservation => reservation.id !== reservationId));
    } catch (err) {
      console.error("Erreur lors de la suppression de la réservation:", err);
      setError("Impossible de supprimer la réservation");
    }
  };

  // Fonction pour rafraîchir manuellement les réservations
  const refreshReservations = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Utiliser le même endpoint que lors du chargement initial
      const response = await axios.get(
        "http://localhost:5000/api/reservations/all",
        { withCredentials: true }
      );
      
      console.log("Réservations rafraîchies:", response.data.length);
      setReservations(response.data);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des réservations:", err);
      
      // Si l'endpoint /reservations/all n'existe pas encore, fallback sur /reservations/user
      try {
        console.log("Tentative de rafraîchissement avec l'endpoint de fallback...");
        const fallbackResponse = await axios.get(
          "http://localhost:5000/api/reservations/user",
          { withCredentials: true }
        );
        
        console.log("Réservations rafraîchies via fallback:", fallbackResponse.data.length);
        setReservations(fallbackResponse.data);
      } catch (fallbackErr) {
        console.error("Erreur lors du rafraîchissement des réservations (fallback):", fallbackErr);
        setError("Impossible de rafraîchir les réservations");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // Obtenir le nom de l'appartement (déjà inclus dans les données)
  const getAppartementName = (reservation) => {
    return reservation.appartement?.titre || "Inconnu";
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

  const handleEditClick = (reservation) => {
    setEditingReservation({
      ...reservation,
      newStatus: reservation.status
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReservation) return;
    
    try {
      await updateReservationStatus(editingReservation.id, editingReservation.newStatus);
      setEditingReservation(null);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des modifications:", err);
      setError("Impossible de sauvegarder les modifications");
    }
  };

  // Filtrer les réservations en fonction des critères de recherche et de statut
  const filteredReservations = reservations.filter(reservation => {
    // Filtrer par statut si un statut spécifique est sélectionné
    if (statusFilter !== "all" && reservation.status !== statusFilter) {
      return false;
    }
    
    // Filtrer par terme de recherche si un terme est saisi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        reservation.user?.nom?.toLowerCase().includes(searchLower) ||
        reservation.user?.email?.toLowerCase().includes(searchLower) ||
        reservation.id.toString().includes(searchLower) ||
        reservation.appartement?.titre?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading && reservations.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestion des Réservations</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
        <button 
          onClick={refreshReservations} 
          className="flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-md hover:bg-rose-200 transition-colors"
          disabled={isRefreshing}
        >
          <svg className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {isRefreshing ? "Rafraîchissement..." : "Rafraîchir"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-1/3">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrer par statut
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en attente">En attente</option>
            <option value="confirmée">Confirmée</option>
            <option value="annulée">Annulée</option>
            <option value="terminée">Terminée</option>
          </select>
        </div>
        
        <div className="md:w-2/3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Rechercher par nom de client, email ou ID de réservation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Tableau des réservations */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réservation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{reservation.id}</div>
                      <div className="text-sm text-gray-500">
                        Créée le {formatDate(reservation.createdAt)}
                      </div>
                      <Link 
                        to={`/reservation/${reservation.id}`}
                        className="text-xs text-rose-600 hover:underline flex items-center mt-1"
                      >
                        Voir détails <FaExternalLinkAlt className="ml-1 text-xs" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.user && reservation.user.id ? (
                          <Link 
                            to={`/admin/client/${String(reservation.user.id)}`} 
                            className="hover:text-rose-600 hover:underline flex items-center"
                            onClick={(e) => {
                              // Log de débogage pour vérifier l'ID
                              console.log("Lien cliqué - ID utilisateur (réservation):", reservation.user?.id);
                              console.log("Type d'ID:", typeof reservation.user?.id);
                            }}
                          >
                            {reservation.user?.nom || "Client inconnu"}
                            <FaExternalLinkAlt className="ml-1 text-xs text-gray-400 hover:text-rose-500" title="Voir le profil complet" />
                          </Link>
                        ) : (
                          <span>{reservation.user?.nom || "Client inconnu"}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.user?.email || "Email inconnu"}</div>
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
                          <div className="text-sm text-gray-900">{getAppartementName(reservation)}</div>
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
                      {reservation.guestsCount || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {reservation.totalPrice}€
                    </td>
                    <td className="px-6 py-4">
                      {editingReservation && editingReservation.id === reservation.id ? (
                        <select
                          value={editingReservation.newStatus}
                          onChange={(e) => setEditingReservation({
                            ...editingReservation,
                            newStatus: e.target.value
                          })}
                          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        >
                          <option value="en attente">En attente</option>
                          <option value="confirmée">Confirmée</option>
                          <option value="annulée">Annulée</option>
                          <option value="terminée">Terminée</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingReservation && editingReservation.id === reservation.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => setEditingReservation(null)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(reservation)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteReservation(reservation.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                          {reservation.status === "en attente" && (
                            <>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, "confirmée")}
                                className="text-green-600 hover:text-green-900"
                                title="Confirmer"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, "annulée")}
                                className="text-red-600 hover:text-red-900"
                                title="Annuler"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination - Simplifiée car nous n'utilisons pas de pagination côté serveur */}
      {filteredReservations.length > 0 && (
        <div className="text-sm text-gray-700 text-center mt-6">
          Affichage de {filteredReservations.length} réservation(s)
        </div>
      )}
    </div>
  );
};

export default AdminReservations; 