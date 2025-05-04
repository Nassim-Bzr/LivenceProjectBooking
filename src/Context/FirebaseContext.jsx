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
  const authTimeoutRef = useRef(null); // Pour gérer le timeout de l'authentification

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

    return () => {
      unsubscribe();
      // Nettoyer le timeout si existant
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, [user, authInProgress]);

  const signInWithGoogle = async () => {
    if (authInProgress) {
      console.log("Une authentification est déjà en cours, ignoré");
      return;
    }
    
    try {
      console.log("Début du processus de connexion Google");
      setAuthInProgress(true);
      authTriggerRef.current = true; // Marquer cette authentification comme intentionnelle
      
      // Mettre en place un timeout pour réinitialiser l'état si ça prend trop de temps
      authTimeoutRef.current = setTimeout(() => {
        console.log("Timeout d'authentification Google atteint, réinitialisation");
        setAuthInProgress(false);
        authTriggerRef.current = false;
        sessionStorage.removeItem('googleLoginAttempt');
        // Rediriger vers la page de login avec un message d'erreur
        window.location.href = '/login?error=timeout';
      }, 30000); // 30 secondes
      
      // Essayer de déconnecter l'utilisateur précédent au cas où
      try {
        console.log("Tentative de déconnexion de l'utilisateur Firebase actuel");
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log("Utilisateur Firebase actuel trouvé:", currentUser.email);
        } else {
          console.log("Aucun utilisateur Firebase actuellement connecté");
        }
        await firebaseSignOut(auth);
        console.log("Déconnexion Firebase réussie");
      } catch (e) {
        // Ignorer les erreurs, nous voulons juste être sûrs qu'il n'y a pas de session
        console.log("Erreur lors de la déconnexion Firebase:", e);
      }
      
      // Sur mobile, utiliser signInWithRedirect qui fonctionne mieux
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log("Appareil mobile détecté, utilisation de signInWithRedirect");
        // Sur mobile, utilisons uniquement signInWithRedirect qui est plus fiable
        try {
          console.log("Redirection vers l'authentification Google...");
          await signInWithRedirect(auth, provider);
          // Ce code ne sera pas exécuté immédiatement car la redirection aura lieu
          console.log("Ce log ne devrait pas apparaître après une redirection");
        } catch (redirectError) {
          console.error("Erreur lors de la redirection:", redirectError);
          throw redirectError; // Propager l'erreur
        }
      } else {
        // Sur desktop, essayer d'abord popup, puis redirection si la popup échoue
        try {
          console.log("Tentative de connexion avec popup");
          const result = await signInWithPopup(auth, provider);
          console.log("Résultat signInWithPopup:", result);
          
          // Nettoyer le timeout car nous avons un résultat
          if (authTimeoutRef.current) {
            clearTimeout(authTimeoutRef.current);
            authTimeoutRef.current = null;
          }
          
          if (result && result.user) {
            console.log("Utilisateur Google authentifié avec popup:", result.user.email);
            const success = await handleGoogleAuth(result.user);
            if (success) {
              console.log("Authentification backend réussie, redirection vers la page d'accueil");
              sessionStorage.removeItem('googleLoginAttempt');
              window.location.href = '/'; // Rediriger vers la page d'accueil en cas de succès
            } else {
              console.error("Échec de l'authentification backend");
              sessionStorage.removeItem('googleLoginAttempt');
              window.location.href = '/login?error=failed';
            }
          } else {
            console.log("La popup a retourné un résultat sans utilisateur");
            sessionStorage.removeItem('googleLoginAttempt');
          }
        } catch (popupError) {
          console.log("Erreur avec popup, tentative de fallback avec redirect:", popupError);
          
          if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
            console.log("Popup bloquée ou fermée, utilisation de la redirection comme fallback");
            // Si la popup échoue (bloquée par le navigateur, etc.), essayer signInWithRedirect en fallback
            try {
              console.log("Redirection vers l'authentification Google...");
              await signInWithRedirect(auth, provider);
              // Ce code ne sera pas exécuté immédiatement car la redirection aura lieu
              console.log("Ce log ne devrait pas apparaître après une redirection");
            } catch (redirectError) {
              console.error("Erreur lors de la redirection:", redirectError);
              throw redirectError; // Propager l'erreur
            }
          } else {
            // Autre erreur avec la popup
            console.error("Erreur non récupérable avec la popup:", popupError);
            throw popupError;
          }
        }
      }
      
    } catch (error) {
      console.error("Erreur de connexion avec Google:", error);
      
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

  // Ajouter un useEffect pour gérer le résultat de la redirection
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        console.log("[handleRedirectResult] Résultat de getRedirectResult:", result);
        console.log("[handleRedirectResult] auth.currentUser:", auth.currentUser);
        
        // Nettoyer le timeout car nous avons un résultat
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }
        
        if (result && result.user) {
          const success = await handleGoogleAuth(result.user);
          if (success) {
            // Nettoyer le drapeau de tentative de connexion
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/'; // Rediriger vers la page d'accueil en cas de succès
          } else {
            // Nettoyer le drapeau de tentative de connexion
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/login?error=failed';
          }
        } else if (auth.currentUser) {
          console.log("[handleRedirectResult] Utilisateur déjà connecté via Firebase:", auth.currentUser);
          const success = await handleGoogleAuth(auth.currentUser);
          if (success) {
            // Nettoyer le drapeau de tentative de connexion
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/';
          } else {
            // Nettoyer le drapeau de tentative de connexion
            sessionStorage.removeItem('googleLoginAttempt');
            window.location.href = '/login?error=failed';
          }
        } else {
          console.log("[handleRedirectResult] Aucun utilisateur trouvé après redirection");
          sessionStorage.removeItem('googleLoginAttempt');
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du résultat de redirection:", error);
        setAuthInProgress(false);
        authTriggerRef.current = false;
        
        // Nettoyer le drapeau de tentative de connexion
        sessionStorage.removeItem('googleLoginAttempt');
        
        // Rediriger avec message d'erreur
        window.location.href = '/login?error=redirect';
      }
    };

    if (window.location.pathname.includes('/login')) {
      handleRedirectResult();
    }
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