import React from "react";

export default function Register() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Créer un compte
        </h2>
        <p className="text-sm text-center text-gray-600 mb-8">
          Remplissez les informations pour vous inscrire
        </p>

        <form>
          {/* Nom complet */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet*
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 mb-5 text-sm bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Email */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email*
          </label>
          <input
            type="email"
            placeholder="exemple@mail.com"
            className="w-full px-4 py-3 mb-5 text-sm bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Mot de passe */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe*
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 mb-6 text-sm bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* Bouton S'inscrire */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
          >
            S'inscrire
          </button>
        </form>

        {/* Lien vers connexion */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Déjà inscrit ?{" "}
          <a href="/login" className="font-bold text-purple-600 hover:underline">
            Connexion
          </a>
        </p>
      </div>
    </div>
  );
}
