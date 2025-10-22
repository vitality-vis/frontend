// API Configuration
// In development: uses localhost:3000
// In production: uses relative URLs (served by Nginx proxy)

const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000'
  : window.location.origin;

export const getApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// For socket.io connections
export const SOCKET_URL = API_BASE_URL;

export default {
  API_BASE_URL,
  SOCKET_URL,
  getApiUrl,
};
