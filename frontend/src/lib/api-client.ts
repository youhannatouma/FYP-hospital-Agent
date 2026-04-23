import axios from 'axios';

/**
 * API Client instance
 * Configured with base URL, auth interceptor, and common headers.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor: automatically attach Clerk token if available
apiClient.interceptors.request.use(
  async (config) => {
    // Only attach token in browser environment
    if (typeof globalThis.window !== 'undefined') {
      try {
        // Access the global Clerk instance set by ClerkProvider
        const clerkInstance = (globalThis as any).Clerk;
        if (clerkInstance?.session) {
          const token = await clerkInstance.session.getToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch {
        // Clerk not available or no session — continue without token
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.detail || 'An unexpected error occurred';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

// Named export so both `import apiClient` and `import { apiClient }` work
export { apiClient };
export default apiClient; 

