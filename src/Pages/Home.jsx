import { useState } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaSearch, FaPlus, FaMinus, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Home() {
  const [guests, setGuests] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);

  // Faux appartements pour la démo
  const appartements = [
    { id: 1, title: "Appartement Cosy à Metz", price: 80, img: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI1ODU4MzI0MzUxNTQ3NTM5MA%3D%3D/original/703bba30-5fc5-463b-a35f-1e2eb65d4911.jpeg?im_w=1200&im_format=avif" },
    { id: 2, title: "Studio Moderne", price: 65, img: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI1ODU4MzI0MzUxNTQ3NTM5MA%3D%3D/original/703bba30-5fc5-463b-a35f-1e2eb65d4911.jpeg?im_w=1200&im_format=avif" },
    { id: 3, title: "Maison Spacieuse", price: 120, img: "https://a0.muscache.com/im/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6MTI1ODU4MzI0MzUxNTQ3NTM5MA%3D%3D/original/703bba30-5fc5-463b-a35f-1e2eb65d4911.jpeg?im_w=1200&im_format=avif" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen py-16">

      {/* FORMULAIRE AVEC ANIMATION */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6 flex flex-wrap gap-4 items-center justify-between"
      >
        {/* Date d'arrivée */}
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <FaCalendarAlt className="text-blue-600" />
          <div>
            <label className="text-sm text-gray-500">Date d'arrivée</label>
            <input type="date" className="block w-full mt-1 text-gray-700 focus:outline-none" />
          </div>
        </div>

        {/* Date de départ */}
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <FaCalendarAlt className="text-blue-600" />
          <div>
            <label className="text-sm text-gray-500">Date de départ</label>
            <input type="date" className="block w-full mt-1 text-gray-700 focus:outline-none" />
          </div>
        </div>

        {/* Invités */}
        <div className="flex items-center gap-2 flex-1 min-w-[150px]">
          <FaUser className="text-blue-600" />
          <div>
            <label className="text-sm text-gray-500">Invités</label>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="p-1 bg-gray-200 rounded-full"
              >
                <FaMinus />
              </button>
              <span>{guests}</span>
              <button
                onClick={() => setGuests(guests + 1)}
                className="p-1 bg-gray-200 rounded-full"
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>

        {/* BOUTON RECHERCHE */}
        <button
          onClick={() => setShowResults(true)}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Rechercher
        </button>
      </motion.section>

      {/* AFFICHAGE DES APPARTEMENTS APRÈS RECHERCHE */}
      {showResults && (
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-12 max-w-5xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {appartements.map((apt) => (
            <div key={apt.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img src={apt.img} alt={apt.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{apt.title}</h3>
                <p className="text-gray-600">{apt.price}€ / nuit</p>
                <Link
  to={`/appartement/${apt.id}`}
  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-center block"
>
  Voir plus
</Link>

              </div>
            </div>
          ))}
        </motion.section>
      )}

      {/* MODAL POUR AFFICHER LES DÉTAILS */}
      {selectedApt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
        >
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 relative">
            
            {/* Bouton pour fermer */}
            <button
              onClick={() => setSelectedApt(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            {/* Contenu des détails */}
            <h2 className="text-2xl font-bold mb-4">{selectedApt.title}</h2>
            <img
              src={selectedApt.img}
              alt={selectedApt.title}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-700 mb-2">Prix : {selectedApt.price} € / nuit</p>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel
              luctus nisi. Sed quis augue ut nisi sodales fermentum.
            </p>

            <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Réserver cet appartement
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
