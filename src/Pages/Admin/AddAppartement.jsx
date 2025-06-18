import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaPlus, FaTrash, FaImage, FaSave, FaBed, FaBath, FaUsers, FaWifi, FaParking, FaSwimmingPool, FaTimes } from "react-icons/fa";

const AddAppartement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const imageInputRef = useRef(null);
  
  // État pour les champs de l'appartement
  const [formData, setFormData] = useState({
    titre: "",
    localisation: "",
    description: "",
    surface: 0,
    prixParNuit: 0,
    capacite: {
      voyageurs: 1,
      chambres: 1,
      lits: 1,
      sallesDeBain: 1
    },
    note: 5,
    nombreAvis: 0,
    hote: {
      nom: user?.nom || "Admin",
      experience: "Nouveau",
      tauxReponse: "100%",
      delaiReponse: "1h"
    },
    regles: {
      arrivee: "15:00 - 00:00",
      depart: "avant 12:00",
      voyageursMax: 2
    },
    images: [],
    equipements: {
      salleDeBain: [],
      internetEtBureau: []
    },
    inclus: [],
    nonInclus: [],
    politiqueAnnulation: "Flexible"
  });
  
  // Options pour les commodités
  const commoditesOptions = [
    { id: "wifi", label: "Wifi", group: "inclus", icon: <FaWifi /> },
    { id: "parking", label: "Parking gratuit", group: "inclus", icon: <FaParking /> },
    { id: "piscine", label: "Piscine", group: "inclus", icon: <FaSwimmingPool /> },
    { id: "seche-cheveux", label: "Sèche-cheveux", group: "nonInclus", icon: null }
  ];

  // Générer un slug à partir du titre
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  };
  
  // Mettre à jour les valeurs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Mettre à jour les valeurs numériques
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Mettre à jour la capacité
  const handleCapaciteChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      capacite: {
        ...prev.capacite,
        [field]: parseInt(value)
      }
    }));
  };
  
  // Ajouter ou retirer une commodité
  const toggleCommodite = (item) => {
    const { label, group } = item;
    
    setFormData(prev => {
      const currentArray = [...prev[group]];
      const exists = currentArray.includes(label);
      
      return {
        ...prev,
        [group]: exists 
          ? currentArray.filter(i => i !== label)
          : [...currentArray, label]
      };
    });
  };
  
  // Ajouter une image avec interface utilisateur
  const handleAddImage = () => {
    setNewImageUrl("");
    setShowImageModal(true);
    setTimeout(() => {
      if (imageInputRef.current) {
        imageInputRef.current.focus();
      }
    }, 100);
  };
  
  // Soumettre l'URL de l'image
  const handleImageSubmit = () => {
    if (newImageUrl && newImageUrl.trim()) {
      const trimmedUrl = newImageUrl.trim();
      
      // Vérifier si l'URL semble valide (commence par http:// ou https://)
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        setError("Veuillez entrer une URL valide commençant par http:// ou https://");
        return;
      }
      
      // Vérifier que l'URL n'est pas trop longue (pour éviter les erreurs)
      if (trimmedUrl.length > 500) {
        setError("L'URL est trop longue. Veuillez entrer une URL plus courte.");
        return;
      }
      
      // Ajouter l'image à la liste
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, trimmedUrl]
      }));
      
      // Fermer le modal et nettoyer
      setShowImageModal(false);
      setNewImageUrl("");
      setError("");
    }
  };
  
  // Vérifier une URL d'image
  const isValidImageUrl = (url) => {
    // Vérification simple pour le format d'URL
    return url && 
           typeof url === 'string' &&
           (url.startsWith('http://') || url.startsWith('https://')) &&
           url.length < 500;
  };
  
  // Supprimer une image
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Envoyer le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setError("");
    
    if (!user) {
      setError("Vous devez être connecté en tant qu'administrateur");
      return;
    }
    
    if (formData.images.length === 0) {
      setError("Vous devez ajouter au moins une image");
      return;
    }
    
    // Vérifier les champs obligatoires
    if (!formData.titre || !formData.localisation || !formData.description || !formData.prixParNuit) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    // Vérifier la validité des URLs d'images
    const validImages = formData.images.filter(isValidImageUrl);
    if (validImages.length === 0) {
      setError("Aucune des images n'a une URL valide");
      return;
    }
    
    if (validImages.length < formData.images.length) {
      // Mettre à jour le formulaire avec seulement les images valides
      setFormData(prev => ({
        ...prev,
        images: validImages
      }));
      
      setError("Certaines URLs d'images invalides ont été retirées");
      return;
    }
    
    setLoading(true);
    
    try {
      // Créer un slug propre à partir du titre
      const slug = generateSlug(formData.titre);
      
      // Générer un smoobuId unique (un nombre aléatoire entre 1 000 000 et 9 999 999)
      const smoobuId = Math.floor(1000000 + Math.random() * 9000000);
      
      // Préparer les données à envoyer avec des champs explicites
      const dataToSend = {
        titre: formData.titre,
        localisation: formData.localisation,
        description: formData.description,
        surface: formData.surface,
        prixParNuit: formData.prixParNuit,
        slug: slug,
        smoobuId: smoobuId, // Ajout d'un ID unique
        note: formData.note,
        nombreAvis: formData.nombreAvis,
        politiqueAnnulation: formData.politiqueAnnulation,
        capacite: JSON.stringify(formData.capacite),
        hote: JSON.stringify(formData.hote),
        regles: JSON.stringify(formData.regles),
        images: JSON.stringify(validImages),
        equipements: JSON.stringify(formData.equipements),
        inclus: JSON.stringify(formData.inclus),
        nonInclus: JSON.stringify(formData.nonInclus)
      };
      
      // Log plus discret
      console.log("Envoi de données pour l'appartement:", formData.titre, "avec smoobuId:", smoobuId);
      
      let attempts = 0;
      let success = false;
      let lastError = null;
      
      // Essayer jusqu'à 3 fois avec des smoobuIds différents
      while (attempts < 3 && !success) {
        attempts++;
        try {
          // Si ce n'est pas la première tentative, générer un nouveau smoobuId
          if (attempts > 1) {
            dataToSend.smoobuId = Math.floor(1000000 + Math.random() * 9000000);
            console.log("Nouvelle tentative avec smoobuId:", dataToSend.smoobuId);
          }
          
          // Envoyer les données à l'API
          const response = await fetch('https://livenc-app-bc6db42f80d2.herokuapp.com/api/appartements', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            credentials: 'include',
            body: JSON.stringify(dataToSend)
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Tentative", attempts, "- Erreur:", errorData);
            
            // Vérifier si c'est une erreur de smoobuId
            if (errorData?.error?.errors?.some(err => err.path === 'smoobuId' && err.type === 'unique violation')) {
              // Continuer la boucle pour réessayer avec un nouveau smoobuId
              lastError = new Error("ID déjà utilisé, nouvelle tentative...");
              continue;
            } else {
              // Si c'est une autre erreur, la lancer
              throw new Error(errorData.message || `Erreur lors de l'ajout de l'appartement (${response.status})`);
            }
          }
          
          // Si on arrive ici, c'est un succès
          const result = await response.json();
          console.log("Appartement ajouté avec succès:", result.id || result._id);
          success = true;
          
          // Vider le cache de l'API pour les requêtes des appartements
          try {
            await fetch('https://livenc-app-bc6db42f80d2.herokuapp.com/api/appartements', {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
          } catch (cacheError) {
            console.log("Note: Impossible de rafraîchir le cache");
          }
          
          setSuccess(true);
          
          // Réinitialiser le formulaire après succès
          setFormData({
            titre: "",
            localisation: "",
            description: "",
            surface: 0,
            prixParNuit: 0,
            capacite: {
              voyageurs: 1,
              chambres: 1,
              lits: 1,
              sallesDeBain: 1
            },
            note: 5,
            nombreAvis: 0,
            hote: {
              nom: user?.nom || "Admin",
              experience: "Nouveau",
              tauxReponse: "100%",
              delaiReponse: "1h"
            },
            regles: {
              arrivee: "15:00 - 00:00",
              depart: "avant 12:00",
              voyageursMax: 2
            },
            images: [],
            equipements: {
              salleDeBain: [],
              internetEtBureau: []
            },
            inclus: [],
            nonInclus: [],
            politiqueAnnulation: "Flexible"
          });
          
          setTimeout(() => {
            // Forcer une redirection avec rechargement de la page pour garantir l'affichage des nouvelles données
            window.location.href = "/";
          }, 2000);
          
        } catch (attemptError) {
          lastError = attemptError;
          // Si ce n'est pas une erreur de smoobuId, sortir de la boucle
          if (!attemptError.message.includes("ID déjà utilisé")) {
            break;
          }
        }
      }
      
      // Si aucune tentative n'a réussi
      if (!success) {
        throw lastError || new Error("Impossible d'ajouter l'appartement après plusieurs tentatives");
      }
      
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error.message);
      setError(error.message || "Une erreur est survenue lors de l'ajout de l'appartement");
    } finally {
      setLoading(false);
    }
  };
  
  // Vérifier si l'utilisateur est connecté et est admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ajouter un appartement</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Appartement ajouté avec succès!
            </p>
            <div className="flex gap-4 ml-auto">
              <button
                onClick={() => {
                  // Réinitialiser le formulaire pour ajouter un nouvel appartement
                  setFormData({
                    titre: "",
                    localisation: "",
                    description: "",
                    surface: 0,
                    prixParNuit: 0,
                    capacite: {
                      voyageurs: 1,
                      chambres: 1,
                      lits: 1,
                      sallesDeBain: 1
                    },
                    note: 5,
                    nombreAvis: 0,
                    hote: {
                      nom: user?.nom || "Admin",
                      experience: "Nouveau",
                      tauxReponse: "100%",
                      delaiReponse: "1h"
                    },
                    regles: {
                      arrivee: "15:00 - 00:00",
                      depart: "avant 12:00",
                      voyageursMax: 2
                    },
                    images: [],
                    equipements: {
                      salleDeBain: [],
                      internetEtBureau: []
                    },
                    inclus: [],
                    nonInclus: [],
                    politiqueAnnulation: "Flexible"
                  });
                  setSuccess(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" />
                Ajouter un autre appartement
              </button>
              <Link 
                to="/"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                onClick={() => window.location.href = "/"}
              >
                Voir sur la page d'accueil
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'ajout d'image */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Ajouter une image</h3>
              <button 
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">URL de l'image</label>
              <input
                ref={imageInputRef}
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleImageSubmit();
                  }
                }}
              />
              <p className="text-sm text-gray-500 mt-1">
                Entrez l'URL d'une image en ligne (commence par http:// ou https://)
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleImageSubmit}
                className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Informations principales */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations principales</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Localisation</label>
              <input
                type="text"
                name="localisation"
                value={formData.localisation}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
                placeholder="Ville, Pays"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Surface (m²)</label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleNumberChange}
                  min="1"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Prix par nuit (€)</label>
                <input
                  type="number"
                  name="prixParNuit"
                  value={formData.prixParNuit}
                  onChange={handleNumberChange}
                  min="1"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Capacité et Images */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Capacité</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="mb-4">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <FaUsers />
                  Voyageurs
                </label>
                <input
                  type="number"
                  value={formData.capacite.voyageurs}
                  onChange={(e) => handleCapaciteChange('voyageurs', e.target.value)}
                  min="1"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <FaBed />
                  Chambres
                </label>
                <input
                  type="number"
                  value={formData.capacite.chambres}
                  onChange={(e) => handleCapaciteChange('chambres', e.target.value)}
                  min="0"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <FaBed />
                  Lits
                </label>
                <input
                  type="number"
                  value={formData.capacite.lits}
                  onChange={(e) => handleCapaciteChange('lits', e.target.value)}
                  min="1"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 text-gray-700 mb-2">
                  <FaBath />
                  Salles de bain
                </label>
                <input
                  type="number"
                  value={formData.capacite.sallesDeBain}
                  onChange={(e) => handleCapaciteChange('sallesDeBain', e.target.value)}
                  min="0"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-4 mb-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Aperçu ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-md border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Erreur+image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-50"
                >
                  <FaImage size={24} />
                  <span className="text-xs mt-1">Ajouter</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-500">
                Ajoutez au moins une image de l'appartement. Utilisez des URL d'images valides.
              </p>
            </div>
          </div>
        </div>
        
        {/* Commodités */}
        <h2 className="text-xl font-semibold mb-4">Commodités</h2>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {commoditesOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCommodite(item)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  formData[item.group].includes(item.label)
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Inclus</h3>
              <ul className="list-disc pl-5">
                {formData.inclus.length > 0 ? (
                  formData.inclus.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li className="text-gray-400">Aucun élément sélectionné</li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Non inclus</h3>
              <ul className="list-disc pl-5">
                {formData.nonInclus.length > 0 ? (
                  formData.nonInclus.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li className="text-gray-400">Aucun élément sélectionné</li>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Politique d'annulation */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Politique d'annulation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="border rounded-md p-4 flex items-start cursor-pointer">
              <input
                type="radio"
                name="politiqueAnnulation"
                value="Flexible"
                checked={formData.politiqueAnnulation === "Flexible"}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <div>
                <span className="font-medium">Flexible</span>
                <p className="text-sm text-gray-500">Annulation gratuite jusqu'à 24h avant l'arrivée</p>
              </div>
            </label>
            
            <label className="border rounded-md p-4 flex items-start cursor-pointer">
              <input
                type="radio"
                name="politiqueAnnulation"
                value="Modérée"
                checked={formData.politiqueAnnulation === "Modérée"}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <div>
                <span className="font-medium">Modérée</span>
                <p className="text-sm text-gray-500">Annulation gratuite jusqu'à 5 jours avant l'arrivée</p>
              </div>
            </label>
            
            <label className="border rounded-md p-4 flex items-start cursor-pointer">
              <input
                type="radio"
                name="politiqueAnnulation"
                value="Stricte"
                checked={formData.politiqueAnnulation === "Stricte"}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <div>
                <span className="font-medium">Stricte</span>
                <p className="text-sm text-gray-500">Remboursement de 50% jusqu'à 7 jours avant l'arrivée</p>
              </div>
            </label>
          </div>
        </div>
        
        {/* Bouton de soumission */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Envoi en cours...
              </>
            ) : (
              <>
                <FaSave />
                Ajouter l'appartement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppartement; 