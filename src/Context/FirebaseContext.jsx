import { createContext, useContext, useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import axios from "axios";
import { useAuth } from "./AuthContext"; // Votre contexte Auth existant

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2by6u0r3rhlBcXiChfiQ79nq21MS-lTY",
  authDomain: "livence-bea2b.firebaseapp.com",
  projectId: "livence-bea2b",
  storageBucket: "livence-bea2b.firebasestorage.app",
  messagingSenderId: "942616473549",
  appId: "1:942616473549:web:f16ed688c1b6fca8625e84",
  measurementId: "G-D2ZXELZVR9"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Forcer la persistance locale de la session Firebase
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistance Firebase forcée sur browserLocalPersistence");
  })
  .catch((error) => {
    console.error("Erreur de setPersistence:", error);
  });

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'  // Force à montrer le sélecteur de compte Google chaque fois
});

// Création du contexte
const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);
  const { user, setUser } = useAuth(); // Récupérer user et setUser
  const authTriggerRef = useRef(false); // Permet de suivre si l'auth a été déclenchée intentionnellement

  const handleGoogleAuth = async (user) => {
    if (authInProgress) return null;
    
    try {
      setAuthInProgress(true);
      console.log("[handleGoogleAuth] Utilisateur reçu:", user);
      // Vérifier si un token existe déjà dans le stockage local et s'il ne s'agit pas d'une connexion intentionnelle
      const existingToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (existingToken && !authTriggerRef.current) {
        console.log("Token déjà existant, on évite la requête au backend");
        setAuthInProgress(false);
        return true; // On considère que l'utilisateur est déjà authentifié
      }
      
      // Réinitialiser le drapeau d'authentification intentionnelle
      authTriggerRef.current = false;
      
      // Envoyer les infos au backend
      const response = await axios.post('https://livence-ef9188d2aef0.herokuapp.com/api/auth/google', {
        email: user.email,
        nom: user.displayName,
        googleId: user.uid,
        photo: user.photoURL
      }, { withCredentials: true });
      
      console.log("[handleGoogleAuth] Réponse backend:", response.data);
      if (response.data.token) {
        // Stocker le token dans le localStorage
        localStorage.setItem("token", response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Mettre à jour l'état utilisateur
        if (response.data.user) {
          const adaptedUser = {
            id: response.data.user.id,
            name: response.data.user.nom,
            email: response.data.user.email,
            role: response.data.user.role,
            photo: response.data.user.photo || null,
            googleId: response.data.user.googleId
          };
          setUser(adaptedUser);
          console.log("[handleGoogleAuth] Utilisateur adapté et setUser:", adaptedUser);
        }
        
        setAuthInProgress(false);
        return true;
      }
      
      setAuthInProgress(false);
      return false;
    } catch (error) {
      console.error("Erreur lors de l'envoi des données Google au backend:", error);
      setAuthInProgress(false);
      return false;
    }
  };

  useEffect(() => {
    // Si l'utilisateur est déjà connecté dans notre contexte Auth, 
    // on n'a pas besoin de déclencher le flux d'authentification Firebase
    if (user) {
      setFirebaseLoading(false);
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      // Ne déclencher l'authentification que si nous n'en avons pas déjà une en cours
      // et si l'utilisateur Firebase existe et si nous sommes sur une page où cela est pertinent
      const isLoginPage = window.location.pathname.includes('/login');
      
      if (fbUser && !authInProgress && (authTriggerRef.current || !isLoginPage)) {
        try {
          await handleGoogleAuth(fbUser);
        } catch (error) {
          console.error("Erreur lors de l'authentification avec le backend:", error);
        }
      }
      
      setFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, [user, authInProgress]);

  const signInWithGoogle = async () => {
    if (authInProgress) return;
    
    try {
      setAuthInProgress(true);
      authTriggerRef.current = true; // Marquer cette authentification comme intentionnelle
      
      // Essayer de déconnecter l'utilisateur précédent au cas où
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        // Ignorer les erreurs, nous voulons juste être sûrs qu'il n'y a pas de session
      }
      
      // Utiliser signInWithPopup sur tous les appareils pour une meilleure fiabilité
      try {
        const result = await signInWithPopup(auth, provider);
        console.log("Résultat signInWithPopup:", result);
        if (result && result.user) {
          const success = await handleGoogleAuth(result.user);
          if (success) {
            // Redirection directe vers la page d'accueil, sans reload
            window.location.href = "/";
          }
        }
      } catch (popupError) {
        console.log("Erreur avec popup, tentative de fallback avec redirect:", popupError);
        // Si la popup échoue (bloquée par le navigateur, etc.), essayer signInWithRedirect en fallback
        await signInWithRedirect(auth, provider);
      }
      
    } catch (error) {
      console.error("Erreur de connexion avec Google:", error);
      setAuthInProgress(false);
      authTriggerRef.current = false;
      throw error;
    }
  };

  // Ajouter un useEffect pour gérer le résultat de la redirection
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        console.log("[handleRedirectResult] Résultat de getRedirectResult:", result);
        console.log("[handleRedirectResult] auth.currentUser:", auth.currentUser);
        if (result && result.user) {
          const success = await handleGoogleAuth(result.user);
          if (success) {
            // Attendre brièvement pour s'assurer que le localStorage est mis à jour
            setTimeout(() => {
              window.location.href = "/";
            }, 200);
          }
        } else if (auth.currentUser) {
          console.log("[handleRedirectResult] Utilisateur déjà connecté via Firebase:", auth.currentUser);
          const success = await handleGoogleAuth(auth.currentUser);
          if (success) {
            // Attendre brièvement pour s'assurer que le localStorage est mis à jour
            setTimeout(() => {
              window.location.href = "/";
            }, 200);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du résultat de redirection:", error);
        setAuthInProgress(false);
        authTriggerRef.current = false;
      }
    };

    handleRedirectResult();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Le logout côté backend sera géré par le AuthContext
    } catch (error) {
      console.error("Erreur lors de la déconnexion Firebase:", error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      firebaseUser, 
      firebaseLoading, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext); 