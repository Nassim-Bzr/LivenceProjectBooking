const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://livenc-app-bc6db42f80d2.herokuapp.com' 
  : 'http://localhost:5000';

export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;

export default API_BASE_URL; 