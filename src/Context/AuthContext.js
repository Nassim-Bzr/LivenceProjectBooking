import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/users/me", { withCredentials: true });
        console.log("Utilisateur récupéré après refresh :", data); // 🔥 Debug
        setUser(data);
      } catch (error) {
        console.error("Erreur de récupération de l'utilisateur :", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("http://localhost:5000/users/login", { email, password }, { withCredentials: true });
      console.log("Utilisateur récupéré après refresh :", data);

      setUser(data.user);
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      throw error;
    }
  };

  const logout = async () => {
    await axios.get("http://localhost:5000/users/logout", { withCredentials: true });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
