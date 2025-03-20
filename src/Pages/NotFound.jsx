import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-purple-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page non trouvée</h2>
        <p className="text-gray-600 mt-4 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <a
          href="/"
          className="inline-block bg-purple-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
