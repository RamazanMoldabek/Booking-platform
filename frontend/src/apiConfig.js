// frontend/src/apiConfig.js
// Общий конфиг для адреса API. Этот файл использует Vite-переменную окружения
// VITE_API_URL и резервный локальный адрес для разработки.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

if (import.meta.env.DEV) {
  console.log('Running in Development mode with API URL:', API_URL);
} else {
  console.log('Running in Production mode with API URL:', API_URL);
}

export default API_URL;
