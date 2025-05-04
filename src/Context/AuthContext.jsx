import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Fonction de connexion
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, { withCredentials: true });

      const { token, user } = response.data;

      // Stocker le token dans localStorage ou sessionStorage selon rememberMe
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      // Configurer l'en-tête d'autorisation par défaut pour toutes les requêtes
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Mettre à jour l'état de l'utilisateur
      setUser(user);

      return user;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Supprimer le token et nettoyer
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      delete axios.defaults.headers.common['Authorization'];
      
      // Réinitialiser l'état
      setUser(null);
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    const checkUserAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true
        });
        
        if (response.data.user) {
          setUser(response.data.user);
          
          try {
            const messagesResponse = await axios.get(`${API_URL}/messages/non-lus/count`, {
              withCredentials: true
            });
            
            if (messagesResponse.data && messagesResponse.data.count) {
              setUnreadMessageCount(messagesResponse.data.count);
            }
          } catch (err) {
            console.error("Erreur lors de la récupération du nombre de messages non lus:", err);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err);
        setUser(null);
        setError("La session a expiré ou est invalide");
        
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAuth();
  }, []);

  const incrementUnreadMessageCount = (count = 1) => {
    setUnreadMessageCount(prev => prev + count);
  };
  
  const resetUnreadMessageCount = () => {
    setUnreadMessageCount(0);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      error, 
      login, 
      logout, 
      register,
      unreadMessageCount,
      setUnreadMessageCount,
      incrementUnreadMessageCount,
      resetUnreadMessageCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}; 