import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // Simulation d'une API pour l'instant
      // await axios.post("http://localhost:5000/users/reset-password", { email });
      setMessage("Un email de réinitialisation a été envoyé à votre adresse si elle existe dans notre base de données.");
    } catch (error) {
      setError("Une erreur est survenue. Veuillez réessayer ultérieurement.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Left side - illustration */}
          <div className="md:w-1/2 bg-blue-600 p-8 flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-3xl font-bold mb-4">Mot de passe oublié?</h1>
              <p className="mb-6 text-blue-100">Pas de problème, nous allons vous aider à récupérer l'accès à votre compte.</p>
              <img 
                src="https://readymadeui.com/readymadeui.svg" 
                alt="logo" 
                className="w-40 mx-auto mb-6" 
              />
              <div className="space-y-4">
                <div className="flex items-center text-left bg-blue-500/30 p-3 rounded-lg">
                  <div className="mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>Nous vous enverrons un email</p>
                </div>
                <div className="flex items-center text-left bg-blue-500/30 p-3 rounded-lg">
                  <div className="mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p>Sécurité renforcée</p>
                </div>
                <div className="flex items-center text-left bg-blue-500/30 p-3 rounded-lg">
                  <div className="mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p>Processus rapide et simple</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - form */}
          <div className="md:w-1/2 p-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Réinitialiser le mot de passe</h2>
                <p className="text-gray-600">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {message}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    placeholder="Entrez votre email"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Envoyer le lien de réinitialisation
                  </button>
                </div>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Retourner à la{" "}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                    page de connexion
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
