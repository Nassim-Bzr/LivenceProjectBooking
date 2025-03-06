import { useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaPlus, FaMinus, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { appartements } from "../Api.js/api"; // ✅ Import de l'API

export default function Home() {
  const [guests, setGuests] = useState(1);
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="bg-gray-100 min-h-screen sm:px-6 lg:px-8">
      {/* BANNIÈRE */}
      <div className="w-screen h-[300px] sm:h-[400px] relative mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <img
          src="https://www.maisonsclairlogis.fr/wp-content/uploads/2024/04/maison-contemporaine_signature_ar_web.jpg"
          alt="Bannière de bienvenue"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white text-4xl font-bold">Bienvenue chez Livence</h1>
        </div>
      </div>

      {/* FORMULAIRE */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date d'arrivée */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'arrivée
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-2 border rounded-lg pl-10"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Date de départ */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de départ
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full p-2 border rounded-lg pl-10"
              />
              <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Nombre de voyageurs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voyageurs
            </label>
            <div className="flex items-center border rounded-lg p-2">
              <FaUser className="text-gray-400 mr-2" />
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="p-1"
              >
                <FaMinus className="text-gray-600" />
              </button>
              <span className="mx-3">{guests}</span>
              <button
                onClick={() => setGuests(guests + 1)}
                className="p-1"
              >
                <FaPlus className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* BOUTON RECHERCHE */}
          <button
            onClick={() => setShowResults(true)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          >
            Rechercher
          </button>
        </div>
      </motion.section>

      {/* APPARTEMENTS */}
    
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-12 max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {appartements.map((apt) => (
            <div
              key={apt.id}
              className="bg-white border rounded-lg shadow-md"
            >
              <Link to={`/appartement/${apt.id}`}>
                <img
                  className="rounded-t-lg w-full h-48 object-cover"
                  src={apt.images[0]}
                  alt={apt.titre}
                />
              </Link>
              <div className="p-5">
                <Link to={`/appartement/${apt.id}`}>
                  <h5 className="text-2xl font-bold">{apt.titre}</h5>
                </Link>
                <p className="text-gray-700">{apt.prixParNuit}€ / nuit</p>
                <Link
                  to={`/appartement/${apt.id}`}
                  className="mt-3 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Voir plus
                </Link>
              </div>
            </div>
          ))}
        </motion.section>
      
    </div>
  );
}
