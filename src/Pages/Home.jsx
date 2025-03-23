import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { FaFilter, FaUser  , FaWifi, FaParking, FaSwimmingPool, FaBed, FaShower, FaEuroSign, FaMapMarkerAlt, FaSearch, FaTimes, FaSync } from "react-icons/fa";

export default function Home() {
  const { user } = useAuth();
  const [appartements, setAppartements] = useState([]);
  const [filteredAppartements, setFilteredAppartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // États pour les filtres
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(0);
  const [bathroomCount, setBathroomCount] = useState(0);
  
  // Liste des commodités disponibles
  const amenities = [
    { id: "wifi", label: "Wifi", icon: <FaWifi /> },
    { id: "parking", label: "Parking gratuit", icon: <FaParking /> },
    { id: "piscine", label: "Piscine", icon: <FaSwimmingPool /> },
    // Ajoutez d'autres commodités au besoin
  ];

  // Fonction de récupération des appartements
  const fetchAppartements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/appartements', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Appartements récupérés:", data);
      setAppartements(data);
      setFilteredAppartements(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des appartements:", error);
      setError("Impossible de charger les appartements");
    } finally {
      setLoading(false);
    }
  }, []);

  // Forcer le rafraîchissement des données
  const handleRefresh = () => {
    // Option 1: Rafraîchir via le state (comportement actuel)
    setRefreshKey(prevKey => prevKey + 1);
    
    // Option 2: Forcer un rechargement complet de la page après un court délai
    // pour laisser le temps à l'utilisateur de voir que le bouton a été cliqué
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  useEffect(() => {
    fetchAppartements();
    
    // Définir un intervalle pour rafraîchir les données périodiquement
    const refreshInterval = setInterval(fetchAppartements, 60000); // Rafraîchir toutes les 60 secondes
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(refreshInterval);
  }, [fetchAppartements, refreshKey]);
  
  // Analyser les données JSON stockées sous forme de string
  const parseJSON = (str) => {
    if (!str) return null;
    
    try {
      // Si la chaîne est déjà un objet, la renvoyer telle quelle
      if (typeof str !== 'string') {
        return str;
      }
      
      // Enlever les guillemets au début et à la fin si la chaîne commence et finit par des guillemets
      let processedStr = str;
      if (str.startsWith('"') && str.endsWith('"')) {
        // Vérifier si la chaîne semble être un JSON échappé
        try {
          // D'abord, on enlève les guillemets extérieurs
          processedStr = str.slice(1, -1);
          // Puis on déséchappe les caractères
          processedStr = processedStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        } catch (e) {
          console.error("Erreur lors du dé-échappement:", e);
        }
      }
      
      // Tenter d'analyser le JSON
      return JSON.parse(processedStr);
    } catch (error) {
      console.error("Erreur de parsing JSON:", error, "pour la chaîne:", str);
      
      // Si l'analyse échoue, mais que la chaîne contient des données qui ressemblent à un objet
      if (typeof str === 'string' && str.includes('{') && str.includes('}')) {
        try {
          // Tenter de nettoyer et de parser manuellement
          const cleanStr = str.replace(/^"/, '').replace(/"$/, '').replace(/\\/g, '');
          return JSON.parse(cleanStr);
        } catch (e) {
          console.error("Deuxième tentative de parsing échouée:", e);
        }
      }
      
      // Renvoyer un objet par défaut en fonction du contexte
      if (str && typeof str === 'string' && str.includes('voyageurs')) {
        return { voyageurs: 1, chambres: 1, lits: 1, sallesDeBain: 1 };
      } else if (str && typeof str === 'string' && str.includes('[')) {
        return [];
      }
      
      return str;
    }
  };
  
  // Récupérer les emplacements uniques pour le filtre de localisation
  const uniqueLocations = [...new Set(appartements.map(apt => apt.localisation))];
  
  // Appliquer les filtres quand les paramètres changent
  useEffect(() => {
    const applyFilters = () => {
      let result = [...appartements];
      
      // Filtre par recherche textuelle (titre ou emplacement)
      if (searchTerm.trim() !== "") {
        result = result.filter(apt => 
          apt.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.localisation.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filtre par fourchette de prix
      result = result.filter(apt => 
        apt.prixParNuit >= priceRange[0] && apt.prixParNuit <= priceRange[1]
      );
      
      // Filtre par commodités
      if (selectedAmenities.length > 0) {
        result = result.filter(apt => {
          try {
            const inclus = parseJSON(apt.inclus);
            return selectedAmenities.every(amenity => 
              Array.isArray(inclus) && inclus.includes(amenity)
            );
          } catch (error) {
            console.error("Erreur lors du filtrage des commodités:", error);
            return false;
          }
        });
      }
      
      // Filtre par emplacement
      if (selectedLocations.length > 0) {
        result = result.filter(apt => 
          selectedLocations.includes(apt.localisation)
        );
      }
      
      // Filtre par nombre de voyageurs
      result = result.filter(apt => {
        try {
          const capacite = parseJSON(apt.capacite);
          return typeof capacite === 'object' && capacite !== null && 
                 typeof capacite.voyageurs === 'number' && capacite.voyageurs >= guestCount;
        } catch (error) {
          console.error("Erreur lors du filtrage des voyageurs:", error);
          return false;
        }
      });
      
      // Filtre par nombre de chambres
      if (bedroomCount > 0) {
        result = result.filter(apt => {
          try {
            const capacite = parseJSON(apt.capacite);
            return typeof capacite === 'object' && capacite !== null && 
                   typeof capacite.chambres === 'number' && capacite.chambres >= bedroomCount;
          } catch (error) {
            console.error("Erreur lors du filtrage des chambres:", error);
            return false;
          }
        });
      }
      
      // Filtre par nombre de salles de bain
      if (bathroomCount > 0) {
        result = result.filter(apt => {
          try {
            const capacite = parseJSON(apt.capacite);
            return typeof capacite === 'object' && capacite.sallesDeBain >= bathroomCount;
          } catch (error) {
            console.error("Erreur lors du filtrage des salles de bain:", error);
            return false;
          }
        });
      }
      
      setFilteredAppartements(result);
    };
    
    if (appartements.length > 0) {
      applyFilters();
    }
  }, [appartements, searchTerm, priceRange, selectedAmenities, selectedLocations, guestCount, bedroomCount, bathroomCount]);
  
  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };
  
  const toggleLocation = (location) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 1000]);
    setSelectedAmenities([]);
    setSelectedLocations([]);
    setGuestCount(1);
    setBedroomCount(0);
    setBathroomCount(0);
  };
  
  // Calculer le prix minimum et maximum pour le slider
  const minPrice = appartements.length > 0 ? Math.min(...appartements.map(apt => apt.prixParNuit)) : 0;
  const maxPrice = appartements.length > 0 ? Math.max(...appartements.map(apt => apt.prixParNuit)) : 1000;

  useEffect(() => {
    // Initialiser la plage de prix une fois que les appartements sont chargés
    if (appartements.length > 0 && priceRange[1] === 1000) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [appartements, minPrice, maxPrice, priceRange]);

  return (
    <div className="bg-gray-100 min-h-screen sm:px-6 lg:px-8">
      {/* BANNIÈRE */}
      <div className="h-[300px] sm:h-[400px] lg:h-[500px] relative -mx-6 lg:-mx-8">
        <img
          src="https://www.maisons-mca.com/wp-content/uploads/2024/01/les-bonnes-raisons-craquer-plan-maison-contemporaine-1.jpg"
          alt="Bannière de bienvenue"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center flex-col gap-4">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
            Bienvenue chez Livence
          </h1>
          {user ? (
            <p className="text-white text-xl sm:text-2xl">Bonjour, {user.nom} </p>
          ) : (
            <p className="text-white text-xl sm:text-2xl">Vous n'êtes pas connecté.</p>
          )}
        </div>
      </div>
      
      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          {/* Barre de recherche et boutons */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par titre ou emplacement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              <FaFilter />
              Filtres
            </button>
            
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              {loading ? "Chargement..." : "Rafraîchir"}
            </button>
            
            {(searchTerm || selectedAmenities.length > 0 || selectedLocations.length > 0 || 
             guestCount > 1 || bedroomCount > 0 || bathroomCount > 0 || 
             priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaTimes />
                Réinitialiser
              </button>
            )}
          </div>
          
          {/* Filtres avancés */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Filtre de prix */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FaEuroSign />
                    Prix par nuit
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span>{priceRange[0]}€</span>
                      <span>{priceRange[1]}€</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full accent-rose-500 absolute"
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex-1 mr-2">
                      <label className="text-sm text-gray-600">Min</label>
                      <input 
                        type="number" 
                        min={minPrice}
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val <= priceRange[1]) {
                            setPriceRange([val, priceRange[1]]);
                          }
                        }}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                    <div className="flex-1 ml-2">
                      <label className="text-sm text-gray-600">Max</label>
                      <input 
                        type="number" 
                        min={priceRange[0]}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= priceRange[0]) {
                            setPriceRange([priceRange[0], val]);
                          }
                        }}
                        className="w-full border rounded p-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Filtre de capacité */}
                <div>
                  <h3 className="font-semibold mb-2">Capacité</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-sm text-gray-600">Voyageurs</label>
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          className="px-3 py-1 border-r"
                        >
                          -
                        </button>
                        <span className="px-3">{guestCount}</span>
                        <button
                          onClick={() => setGuestCount(guestCount + 1)}
                          className="px-3 py-1 border-l"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">Chambres</label>
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => setBedroomCount(Math.max(0, bedroomCount - 1))}
                          className="px-3 py-1 border-r"
                        >
                          -
                        </button>
                        <span className="px-3">{bedroomCount}</span>
                        <button
                          onClick={() => setBedroomCount(bedroomCount + 1)}
                          className="px-3 py-1 border-l"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-gray-600">SDB</label>
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => setBathroomCount(Math.max(0, bathroomCount - 1))}
                          className="px-3 py-1 border-r"
                        >
                          -
                        </button>
                        <span className="px-3">{bathroomCount}</span>
                        <button
                          onClick={() => setBathroomCount(bathroomCount + 1)}
                          className="px-3 py-1 border-l"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Filtre de commodités */}
                <div>
                  <h3 className="font-semibold mb-2">Commodités</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.label)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          selectedAmenities.includes(amenity.label)
                            ? "bg-rose-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {amenity.icon}
                        {amenity.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Filtre d'emplacement */}
                <div className="md:col-span-2 lg:col-span-3">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt />
                    Emplacement
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueLocations.map((location) => (
                      <button
                        key={location}
                        onClick={() => toggleLocation(location)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedLocations.includes(location)
                            ? "bg-rose-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* RÉSULTATS */}
      <div className="max-w-6xl mx-auto mb-12">
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredAppartements.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {filteredAppartements.length} {filteredAppartements.length === 1 ? "logement" : "logements"} disponible{filteredAppartements.length > 1 ? "s" : ""}
              </h2>
            </div>
            
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredAppartements.map((apt) => {
                // Essayer de parser les données JSON avec gestion des erreurs
                const parsedImages = parseJSON(apt.images);
                const parsedCapacite = parseJSON(apt.capacite);
                
                // Valeurs par défaut en cas d'échec de parsing
                const imageUrl = Array.isArray(parsedImages) && parsedImages.length > 0 
                  ? parsedImages[0] 
                  : 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                
                const capacite = typeof parsedCapacite === 'object' ? parsedCapacite : {
                  voyageurs: 1,
                  chambres: 1,
                  sallesDeBain: 1
                };
                
                return (
                  <motion.div
                    key={apt.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link to={`/appartement/${apt.slug}`}>
                      <div className="relative">
                        <img
                          className="w-full h-48 object-cover"
                          src={imageUrl}
                          alt={apt.titre}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200?text=Erreur+de+chargement';
                          }}
                        />
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white px-2 py-1 text-sm font-bold">
                          {apt.prixParNuit}€ / nuit
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-xl font-bold">{apt.titre}</h5>
                        </div>
                        <p className="text-gray-600 flex items-center gap-1 mb-2">
                          <FaMapMarkerAlt className="text-rose-500" />
                          {apt.localisation}
                        </p>
                        <div className="flex gap-4 text-gray-700 text-sm">
                          <span className="flex items-center gap-1">
                            <FaBed />
                            {capacite.chambres} ch.
                          </span>
                          <span className="flex items-center gap-1">
                            <FaShower />
                            {capacite.sallesDeBain} sdb
                          </span>
                          <span className="flex items-center gap-1">
                            <FaUser />
                            {capacite.voyageurs} pers.
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.section>
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Aucun logement ne correspond à vos critères</h3>
            <p className="text-gray-600 mb-4">Essayez de modifier vos filtres pour voir plus de résultats.</p>
            <button
              onClick={resetFilters}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
