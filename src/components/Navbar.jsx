import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-rose-600">Livence</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <NotificationBell />}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Mon Profil
                </Link>
                <button
                  onClick={logout}
                  className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-rose-700"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 