// frontend/src/apiConfig.js
// Общий конфиг для адреса API. Этот файл использует Vite-переменную окружения
// VITE_API_URL и резервный локальный адрес для разработки.

let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Удаляем лишние слеши в конце и гарантируем наличие /api
baseUrl = baseUrl.replace(/\/+$/, ""); 
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

if (import.meta.env.DEV) {
  console.log('Running in Development mode with API URL:', API_URL);
} else {
  console.log('Running in Production mode with API URL:', API_URL);
}

export default API_URL;
