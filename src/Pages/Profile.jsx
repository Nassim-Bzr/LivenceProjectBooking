import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
  
      const fetchReservations = async () => {
        try {
          const response = await axios.get("http://localhost:5000/reservations/user", { withCredentials: true });
          console.log("🔍 Réservations récupérées :", response.data); // 🔥 Debug
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/users/update", formData, {
        withCredentials: true,
      });
      setIsEditing(false);
      // Refresh the page or update user context
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Left sidebar with profile picture and menu */}
          <div className="md:w-1/3 bg-gray-50 p-6 border-r">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full bg-gray-200">
                <img 
                  src={user?.avatar || ""} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "";
                  }}
                />
              </div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            
            <div className="space-y-2">
              <button 
                className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Annuler les modifications" : "Modifier le profil"}
              </button>
              <button 
                className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:w-2/3 p-6">
            {isEditing ? (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Modifier mes informations</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="name">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="phone">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="bio">
                      À propos de moi
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Enregistrer
                  </button>
                </form>
              </div>
            ) : (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Mes informations</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-500">Nom complet</h4>
                    <p>{user?.name || "Non défini"}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-500">Email</h4>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-500">Téléphone</h4>
                    <p>{user?.phone || "Non défini"}</p>
                  </div>
                  <div>
                    <h4 className="text-gray-500">À propos de moi</h4>
                    <p>{user?.bio || "Aucune information"}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Mes réservations</h3>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{reservation.apartment?.title || "Appartement"}</h4>
                          <p className="text-gray-600">
                            {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Statut: <span className="font-medium">{reservation.status}</span>
                          </p>
                        </div>
                        <span className="font-bold">{reservation.totalPrice} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Vous n'avez pas encore de réservation.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 