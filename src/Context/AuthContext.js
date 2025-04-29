import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Configuration des headers par défaut pour Axios
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Récupérer le token du localStorage/sessionStorage pour l'envoyer
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!storedToken) {
          setLoading(false);
          return;
        }
        
        const headers = { Authorization: `Bearer ${storedToken}` };
          
        const { data } = await axios.get(`${API_URL}/auth/me`, { 
          withCredentials: true,
          headers
        });
        
        console.log("Utilisateur récupéré après refresh :", data); 
        if (data && data.user) {
          // Adapter le format des données de l'utilisateur pour correspondre à l'attendu par le frontend
          const adaptedUser = {
            id: data.user.id,
            name: data.user.nom, // Renommer nom en name pour le frontend
            email: data.user.email,
            role: data.user.role,
            photo: data.user.photo || null,
            googleId: data.user.googleId || null
          };
          setUser(adaptedUser);
        }
      } catch (error) {
        console.error("Erreur de récupération de l'utilisateur :", error);
        // Effacer tout token stocké en cas d'erreur
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  

  const login = async (email, password, rememberMe = false) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
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

      if (data.user) {
        // Adapter le format des données de l'utilisateur pour correspondre à l'attendu par le frontend
        const adaptedUser = {
          id: data.user.id,
          name: data.user.nom, // Renommer nom en name pour le frontend
          email: data.user.email,
          role: data.user.role,
          photo: data.user.photo || null,
          googleId: data.user.googleId || null
        };
        setUser(adaptedUser);
      }
      
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
      
      // Utiliser le nouveau point d'accès
      await axios.post(`${API_URL}/auth/logout`, {}, { 
        withCredentials: true,
        headers 
      });
      
      // Nettoyer les tokens stockés
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      
      // Déconnecter l'utilisateur de Firebase directement avec getAuth
      try {
        // Import Firebase Auth dynamiquement pour éviter les dépendances circulaires
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        await auth.signOut();
        console.log("Déconnexion Firebase réussie");
      } catch (e) {
        console.error("Erreur de déconnexion Firebase:", e);
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Même en cas d'erreur avec le backend, on déconnecte l'utilisateur localement
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      
      // Déconnecter l'utilisateur de Firebase malgré l'erreur backend
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        await auth.signOut();
        console.log("Déconnexion Firebase réussie");
      } catch (e) {
        console.error("Erreur de déconnexion Firebase:", e);
      }
    } finally {
      // Après déconnexion, rediriger vers la page d'accueil
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
