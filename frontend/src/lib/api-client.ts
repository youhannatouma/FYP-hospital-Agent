import axios from 'axios';

/**
 * API Client instance
 * Configured with base URL and common headers.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.log('[API Error]', message);
    return Promise.reject(error);
  }
);

export default apiClient;
