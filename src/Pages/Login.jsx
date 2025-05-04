import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useFirebase } from "../Context/FirebaseContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

export default function Login() {
  const { login, user } = useAuth();
  const { signInWithGoogle } = useFirebase();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirectLogin, setIsRedirectLogin] = useState(false);

  // Au début, vérifier si nous sommes dans un processus de redirection Google
  useEffect(() => {
    // Si l'URL a un paramètre lié à une redirection Google (soit error, soit code)
    const params = new URLSearchParams(location.search);
    if (params.has('error') || params.has('code') || sessionStorage.getItem('googleLoginAttempt')) {
      console.log("Détection d'un processus de redirection Google en cours");
      setIsRedirectLogin(true);
    }
  }, [location.search]);

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Gérer les erreurs provenant des redirections ou du processus de connexion Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorType = params.get('error');
    
    if (errorType) {
      switch(errorType) {
        case 'timeout':
          setError("La connexion avec Google a pris trop de temps. Veuillez réessayer.");
          break;
        case 'failed':
          setError("Échec de la connexion avec Google. Veuillez réessayer ou utiliser une autre méthode.");
          break;
        case 'redirect':
          setError("Erreur lors de la redirection Google. Veuillez réessayer.");
          break;
        case 'general':
          setError("Une erreur s'est produite lors de la connexion avec Google. Veuillez réessayer.");
          break;
        default:
          setError("Erreur de connexion. Veuillez réessayer.");
      }
      
      // Nettoyer l'URL
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate]);

  // Au chargement de la page de login, nous nous assurons qu'aucune session Firebase n'est active
  // SAUF si nous sommes dans un processus de redirection
  useEffect(() => {
    // Ne pas nettoyer la session si nous sommes dans un processus de redirection Google
    if (isRedirectLogin) {
      console.log("Processus de redirection Google détecté, conservation de la session Firebase");
      return;
    }

    const cleanupFirebaseSession = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        console.log("Session Firebase nettoyée au chargement de la page de login");
      } catch (e) {
        console.log("Pas de session Firebase à nettoyer ou erreur:", e);
      }
    };
    
    cleanupFirebaseSession();
  }, [isRedirectLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Email ou mot de passe incorrect. Veuillez réessayer.");
        } else if (error.response.status === 500) {
          setError("Erreur serveur. Veuillez réessayer plus tard.");
        } else {
          setError(error.response.data.message || "Une erreur est survenue lors de la connexion.");
        }
      } else if (error.request) {
        setError("Impossible de contacter le serveur. Vérifiez votre connexion internet.");
      } else {
        setError("Une erreur est survenue lors de la préparation de la requête.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Marquer qu'une tentative de connexion Google est en cours
      sessionStorage.setItem('googleLoginAttempt', 'true');
      
      // On tente une déconnexion Firebase avant la connexion pour éviter les problèmes de session
      try {
        const auth = getAuth();
        await signOut(auth);
      } catch (e) {
        console.error("Erreur lors de la déconnexion Firebase préalable:", e);
      }
      
      // Maintenant on peut procéder à la connexion Google
      await signInWithGoogle();
      
      // Note: La redirection est maintenant gérée directement dans FirebaseContext
    } catch (error) {
      console.error("Erreur de connexion avec Google:", error);
      setError("Problème lors de la connexion avec Google. Veuillez réessayer.");
      setLoading(false);
      sessionStorage.removeItem('googleLoginAttempt'); // Nettoyer en cas d'erreur
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{" "}
            <Link to="/register" className="font-medium text-rose-600 hover:text-rose-500">
              créez votre compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-rose-600 hover:text-rose-500">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path 
                  fill="#EA4335" 
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                />
                <path 
                  fill="#34A853" 
                  d="M23.49 12.275C23.49 11.49 23.4101 10.73 23.27 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                />
                <path 
                  fill="#FBBC05" 
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                />
                <path 
                  fill="#4285F4" 
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                />
              </svg>
              {loading ? "Connexion en cours..." : "Se connecter avec Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
