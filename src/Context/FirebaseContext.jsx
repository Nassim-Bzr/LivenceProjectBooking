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
  browserLocalPersistence,
  inMemoryPersistence
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
console.log("Initialisation de Firebase");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: 'select_account',  // Force à montrer le sélecteur de compte Google chaque fois
  // Ajouter d'autres paramètres qui pourraient aider
  access_type: 'offline',
  include_granted_scopes: 'true'
});

// Forcer la persistance locale de la session Firebase
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistance Firebase forcée sur browserLocalPersistence");
  })
  .catch((error) => {
    console.error("Erreur de setPersistence:", error);
  });

// Création du contexte
const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);
  const { user, setUser } = useAuth(); // Récupérer user et setUser
  const authTriggerRef = useRef(false); // Permet de suivre si l'auth a été déclenchée intentionnellement
  const authTimeoutRef = useRef(null); // Pour gérer le timeout de l'authentification

  const handleGoogleAuth = async (user) => {
    if (!user) {
      console.error("handleGoogleAuth appelé sans utilisateur");
      return false;
    }
    
    if (authInProgress) {
      console.log("Authentification déjà en cours, ignorant handleGoogleAuth");
      return null;
    }
    
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
      
      console.log("Envoi des données au backend avec email:", user.email);
      
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

  // Surveillez les changements d'état d'authentification Firebase
  useEffect(() => {
    console.log("Configuration de onAuthStateChanged");
    
    // Si l'utilisateur est déjà connecté dans notre contexte Auth, 
    // on n'a pas besoin de déclencher le flux d'authentification Firebase
    if (user) {
      console.log("Utilisateur déjà connecté dans AuthContext, pas besoin de vérifier Firebase");
      setFirebaseLoading(false);
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log("onAuthStateChanged appelé avec utilisateur:", fbUser ? fbUser.email : "null");
      setFirebaseUser(fbUser);
      
      // Ne traiter l'utilisateur Firebase que s'il existe et s'il n'y a pas d'authentification en cours
      if (fbUser && !authInProgress) {
        console.log("Tentative d'authentification avec l'utilisateur Firebase:", fbUser.email);
        
        // Tentative de connexion avec l'utilisateur Firebase
        try {
          const success = await handleGoogleAuth(fbUser);
          
          console.log("Résultat de handleGoogleAuth:", success);
          
          if (success && sessionStorage.getItem('googleLoginAttempt')) {
            console.log("Authentification réussie après tentative de connexion Google, redirection");
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/';
          }
        } catch (error) {
          console.error("Erreur lors de l'authentification avec le backend:", error);
        }
      }
      
      setFirebaseLoading(false);
    });

    return () => {
      console.log("Nettoyage de onAuthStateChanged");
      unsubscribe();
      
      // Nettoyer le timeout si existant
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
    };
  }, [user]);

  const signInWithGoogle = async () => {
    if (authInProgress) {
      console.log("Une authentification est déjà en cours, ignoré");
      return;
    }
    
    try {
      console.log("Début du processus de connexion Google");
      setAuthInProgress(true);
      authTriggerRef.current = true; // Marquer cette authentification comme intentionnelle
      
      // Marquer qu'une tentative de connexion Google est en cours
      sessionStorage.setItem('googleLoginAttempt', 'true');
      
      // Mettre en place un timeout pour réinitialiser l'état si ça prend trop de temps
      authTimeoutRef.current = setTimeout(() => {
        console.log("Timeout d'authentification Google atteint, réinitialisation");
        setAuthInProgress(false);
        authTriggerRef.current = false;
        sessionStorage.removeItem('googleLoginAttempt');
        // Rediriger vers la page de login avec un message d'erreur
        window.location.href = '/login?error=timeout';
      }, 30000); // 30 secondes
      
      // S'assurer que Firebase utilise la bonne persistance
      await setPersistence(auth, browserLocalPersistence);
      
      // Sur mobile, utiliser signInWithRedirect qui fonctionne mieux
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // NOUVELLE APPROCHE: Utiliser uniquement signInWithPopup qui est plus fiable
      // et le laisser gérer lui-même le fallback vers redirect si nécessaire
      try {
        console.log("Tentative d'authentification avec popup Google");
        const result = await signInWithPopup(auth, provider);
        
        // Nettoyer le timeout car nous avons un résultat
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
        
        console.log("Résultat signInWithPopup:", result);
        console.log("Utilisateur Google:", result.user);
        
        // L'utilisateur devrait maintenant être disponible via onAuthStateChanged
        // mais nous pouvons aussi le traiter directement ici
        if (result.user) {
          const success = await handleGoogleAuth(result.user);
          if (success) {
            console.log("Authentification réussie, redirection vers la page d'accueil");
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/';
          } else {
            console.error("Échec de l'authentification backend");
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/login?error=failed';
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'authentification Google:", error);
        
        // Si c'est une erreur de popup bloquée, essayer avec redirection
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
          console.log("Popup bloquée, tentative avec redirection");
          
          try {
            await signInWithRedirect(auth, provider);
            // Ce code ne sera pas exécuté immédiatement car la redirection aura lieu
          } catch (redirectError) {
            console.error("Erreur lors de la redirection:", redirectError);
            throw redirectError;
          }
        } else {
          // Autre type d'erreur
          console.error("Erreur non récupérable lors de l'authentification Google:", error);
          
          // Nettoyer
          setAuthInProgress(false);
          authTriggerRef.current = false;
          sessionStorage.removeItem('googleLoginAttempt');
          
          window.location.href = '/login?error=general';
        }
      }
    } catch (error) {
      console.error("Erreur non gérée lors de l'authentification Google:", error);
      
      // Nettoyer le timeout
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }
      
      setAuthInProgress(false);
      authTriggerRef.current = false;
      sessionStorage.removeItem('googleLoginAttempt');
      
      // Rediriger avec message d'erreur
      window.location.href = '/login?error=general';
    }
  };

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