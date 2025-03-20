import React from "react";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Réinitialiser le mot de passe
        </h2>

        <p className="text-gray-600 text-center mb-8">
          Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              placeholder="exemple@mail.com"
              className="w-full px-4 py-3 text-sm bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
          >
            Envoyer le lien
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Retourner à la{" "}
          <a href="/login" className="font-bold text-purple-600 hover:underline">
            page de connexion
          </a>
        </p>
      </div>
    </div>
  );
}
