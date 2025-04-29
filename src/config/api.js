const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://livence-ef9188d2aef0.herokuapp.com' 
  : 'http://localhost:5000';

export const API_URL = `${API_BASE_URL}/api`;
export const SOCKET_URL = API_BASE_URL;

export default API_BASE_URL; 