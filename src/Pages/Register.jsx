import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/users/register", {
        nom,
        email,
        password,
      });

      console.log(response.data);
      navigate("/login"); // Redirige l'utilisateur après l'inscription réussie
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Créer un compte</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet*</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full px-4 py-3 mb-5 bg-gray-100 rounded-2xl"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 mb-5 bg-gray-100 rounded-2xl"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe*</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 mb-6 bg-gray-100 rounded-2xl"
            required
          />

          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-2xl">
            S'inscrire
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Déjà inscrit ? <a href="/login" className="text-purple-600">Connexion</a>
        </p>
      </div>
    </div>
  );
}
