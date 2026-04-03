



let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


baseUrl = baseUrl.replace(/\/+$/, ""); 
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

if (import.meta.env.DEV) {
  console.log('Running in Development mode with API URL:', API_URL);
} else {
  console.log('Running in Production mode with API URL:', API_URL);
}

export default API_URL;
