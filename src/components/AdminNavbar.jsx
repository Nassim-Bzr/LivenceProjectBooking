import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { FaHome, FaBuilding, FaCalendarAlt, FaUsers, FaComments, FaBars, FaTimes } from "react-icons/fa";

const AdminNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Vérifier si l'utilisateur est admin
  if (!user || user.role !== "admin") {
    return null;
  }

  // Vérifier si le chemin actuel correspond au lien
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items
  const navItems = [
    {
      name: "Tableau de bord",
      path: "/admin",
      icon: <FaHome className="mr-2" />
    },
    {
      name: "Appartements",
      path: "/admin/appartements",
      icon: <FaBuilding className="mr-2" />
    },
    {
      name: "Réservations",
      path: "/admin/reservations",
      icon: <FaCalendarAlt className="mr-2" />
    },
    {
      name: "Utilisateurs",
      path: "/admin/users",
      icon: <FaUsers className="mr-2" />
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <FaComments className="mr-2" />
    }
  ];

  return (
    <div className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl">
                Admin Panel
              </Link>
            </div>
          </div>

          {/* Menu pour mobiles */}
          <div className="flex items-center -mr-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Menu pour desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive(item.path)
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            <Link
              to="/"
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Retour au site
            </Link>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActive(item.path)
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Retour au site
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNavbar;