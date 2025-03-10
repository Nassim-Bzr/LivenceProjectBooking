import { motion } from "framer-motion";
import SmoobuReservation from "../components/SmoobuReservation";
import { appartements } from "../Api.js/api"; 
import { Link } from "react-router-dom";

export default function Home() {
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

      {/* IFRAME SMOOBU UNIQUEMENT */}
      <SmoobuReservation />

      {/* LISTE DES APPARTEMENTS */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-12 max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {appartements.map((apt) => (
          <div
            key={apt.id}
            className="bg-white border rounded-lg shadow-md mt-10 mb-24"
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
