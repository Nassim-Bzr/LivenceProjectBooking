import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaUpload, FaCreditCard, FaHistory, FaEnvelope } from "react-icons/fa";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    country: ""
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("Données utilisateur dans Profile:", user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.photo || "",
        billingAddress: user.billingAddress || "",
        city: user.city || "",
        postalCode: user.postalCode || "",
        country: user.country || ""
      });
  
      const fetchReservations = async () => {
        try {
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          const response = await axios.get("http://localhost:5000/api/reservations/user", { 
            withCredentials: true,
            headers
          });
          setReservations(response.data);
        } catch (error) {
          console.error("❌ Erreur récupération réservations:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchReservations();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      try {
        const response = await axios.post("http://localhost:5000/users/upload-avatar", formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setFormData(prev => ({...prev, avatar: response.data.avatarUrl}));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/users/update", formData, {
        withCredentials: true,
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Mon profil</h1>
      
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Left sidebar with profile picture and menu */}
          <div className="md:w-1/3 bg-gradient-to-b from-blue-50 to-gray-50 p-8 border-r">
            <div className="text-center mb-8">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-blue-100">
                  <img 
                    src={user?.photo || formData.avatar || "https://via.placeholder.com/150"} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <FaUpload className="text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.name || "Utilisateur"}</h2>
              <p className="text-gray-600">{user?.email || "Email non disponible"}</p>
            </div>
            
            <div className="space-y-3">
              <button 
                className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all font-medium text-gray-700"
                onClick={() => setIsEditing(!isEditing)}
              >
                <FaUser className="mr-3" />
                {isEditing ? "Annuler les modifications" : "Modifier le profil"}
              </button>
              <button 
                className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-white hover:shadow-md transition-all font-medium text-gray-700"
                onClick={handleLogout}
              >
                <FaHistory className="mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:w-2/3 p-8">
            {isEditing ? (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Modifier mes informations</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="name">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="phone">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="billingAddress">
                        Adresse de facturation
                      </label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="city">
                        Ville
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="postalCode">
                        Code postal
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium" htmlFor="bio">
                      À propos de moi
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="ml-4 bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                </form>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Mes informations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-gray-500 text-sm">Nom complet</h4>
                    <p className="font-medium">{user?.name || "Non défini"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-gray-500 text-sm">Email</h4>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-gray-500 text-sm">Téléphone</h4>
                    <p className="font-medium">{user?.phone || "Non défini"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-gray-500 text-sm">Adresse</h4>
                    <p className="font-medium">{user?.billingAddress || "Non définie"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-gray-500 text-sm">Ville</h4>
                    <p className="font-medium">{user?.city || "Non définie"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-gray-500 text-sm">Code postal</h4>
                    <p className="font-medium">{user?.postalCode || "Non défini"}</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-gray-500 text-sm">À propos de moi</h4>
                  <p className="font-medium">{user?.bio || "Aucune information"}</p>
                </div>
              </div>
            )}
            
            <div className="mb-8">
              <ul className="flex flex-col space-y-2">
                <li className="p-3 bg-blue-50 rounded-md font-medium text-blue-800 flex items-center">
                  <FaUser className="mr-2" />
                  Informations personnelles
                </li>
                <li>
                  <Link 
                    to="/messages" 
                    className="p-3 hover:bg-gray-50 rounded-md flex items-center text-gray-700 hover:text-gray-900 transition"
                  >
                    <FaEnvelope className="mr-2" />
                    Messages
                  </Link>
                </li>
                <li>
                  <button className="p-3 hover:bg-gray-50 rounded-md w-full text-left flex items-center text-gray-700 hover:text-gray-900 transition">
                    <FaHistory className="mr-2" />
                    Historique des réservations
                  </button>
                </li>
                <li>
                  <button className="p-3 hover:bg-gray-50 rounded-md w-full text-left flex items-center text-gray-700 hover:text-gray-900 transition">
                    <FaCreditCard className="mr-2" />
                    Moyens de paiement
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                <FaCreditCard className="mr-3" />
                Mes réservations
              </h3>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            {reservation.appartement?.titre || "Appartement"}
                          </h4>
                          <p className="text-gray-600">
                            Du {new Date(reservation.startDate).toLocaleDateString('fr-FR')} au {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm mt-2">
                            Statut: <span className={`font-medium px-3 py-1 rounded-full ${
                              reservation.status === "confirmée" ? "bg-green-100 text-green-800" :
                              reservation.status === "en attente" ? "bg-yellow-100 text-yellow-800" :
                              reservation.status === "annulée" ? "bg-red-100 text-red-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {reservation.status}
                            </span>
                          </p>
                          <p className="text-sm mt-2 text-gray-600">
                            Adresse: {reservation.appartement?.localisation || "Non spécifiée"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">{reservation.totalPrice} €</span>
                          <div className="mt-2">
                            <button 
                              onClick={() => navigate(`/reservation/${reservation.id}`)}
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                              Voir les détails
                            </button>
                          </div>
                        </div>
                      </div>
                      {reservation.appartement?.images && reservation.appartement.images.length > 0 && (
                        <div className="mt-4">
                          <img 
                            src={Array.isArray(reservation.appartement.images) 
                              ? reservation.appartement.images[0]
                              : typeof reservation.appartement.images === 'string'
                              ? reservation.appartement.images
                              : "https://via.placeholder.com/300x150"}
                            alt={reservation.appartement.titre}
                            className="w-full h-40 object-cover rounded-md"
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = "https://via.placeholder.com/300x150";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Vous n'avez pas encore de réservation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;