import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Récupérer le token du localStorage/sessionStorage pour l'envoyer
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        const headers = storedToken 
          ? { Authorization: `Bearer ${storedToken}` }
          : {};
          
        const { data } = await axios.get("http://localhost:5000/users/me", { 
          withCredentials: true,
          headers
        });
        
        console.log("Utilisateur récupéré après refresh :", data); 
        setUser(data);
      } catch (error) {
        console.error("Erreur de récupération de l'utilisateur :", error);
        // Effacer tout token stocké en cas d'erreur
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  

  const login = async (email, password, rememberMe = false) => {
    try {
      const { data } = await axios.post("http://localhost:5000/users/login", { email, password }, { withCredentials: true });
      console.log("Réponse de connexion:", data);

      // Stocker le token reçu
      if (data.token) {
        // Si "se souvenir de moi" est coché, stocker dans localStorage (persistant)
        // Sinon, stocker dans sessionStorage (session only)
        if (rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }
        
        // Configurer axios pour toujours envoyer le token
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }

      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Préparer le header avec le token si disponible
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Utiliser l'ancien point d'accès mais conserver la méthode POST
      await axios.post("http://localhost:5000/users/logout", {}, { 
        withCredentials: true,
        headers 
      });
      
      // Nettoyer les tokens stockés
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      // Après déconnexion, rediriger vers la page d'accueil
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur avec le backend, on déconnecte l'utilisateur localement
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
