import { motion } from "framer-motion";
import { appartements } from "../Api.js/api";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function Home() {

  const { user } = useAuth(); // 🔥 Récupère l'utilisateur connecté

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
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold text-center">
            Bienvenue chez Livence
          </h1>
        </div>
      </div>
      <div>
      <h1>Bienvenue sur notre plateforme</h1>
      
      {user ? (
        <p>Bonjour, {user.nom} 👋</p>
      ) : (
        <p>Vous n'êtes pas connecté.</p>
      )}
    </div>
      {/* LISTE DES APPARTEMENTS */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-12 max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {appartements.map((apt) => (
          <div key={apt.id} className="bg-white border rounded-lg shadow-md">
            <Link to={`/appartement/${apt.slug}`}>
              <img
                className="rounded-t-lg w-full h-48 object-cover"
                src={apt.image}
                alt={apt.titre}
              />
              <div className="p-5">
                <h5 className="text-2xl font-bold">{apt.titre}</h5>
                <p className="text-gray-700">{apt.prixParNuit}€ / nuit</p>
              </div>
            </Link>
          </div>
        ))}
      </motion.section>
    </div>
  );
}
