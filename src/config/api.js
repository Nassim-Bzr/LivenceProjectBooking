// Utiliser l'URL du .env ou Heroku par défaut
const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL.replace('/api', '') // Enlever /api s'il est déjà dans la variable
  : 'https://livenc-app-bc6db42f80d2.herokuapp.com';

export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;

export default API_BASE_URL; 