import axios from 'axios';

// Get the base URL from environment variables, with a fallback for local development
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Allows sending cookies cross-origin (important for sessions/auth)
  // You can add other default settings here, like timeout
  // timeout: 10000, 
});

// Optional: Add interceptors for request/response handling (e.g., error handling, auth tokens)
// apiClient.interceptors.request.use(config => {
//   // Maybe add auth token here
//   return config;
// });

// apiClient.interceptors.response.use(
//   response => response, 
//   error => {
//     // Handle global errors (like 401 Unauthorized)
//     if (error.response && error.response.status === 401) {
//       // Redirect to login or refresh token logic
//       console.error("Unauthorized access - redirecting to login might be needed.");
//       // window.location.href = '/login'; 
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient; 
 
 