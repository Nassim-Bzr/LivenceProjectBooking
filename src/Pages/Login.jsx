import { useState } from "react";
import { useAuth } from "../Context/AuthContext"; // 🔥 Utilisation du contexte
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth(); // 🔥 On récupère la fonction `login` du contexte
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // 🔥 Connexion via `useAuth`
      navigate("/"); // 🔥 Redirection après connexion
    } catch (error) {
      alert("Email ou mot de passe incorrect !");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Se connecter
        </h2>

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-2xl"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
