import axios from "axios";

// API configuration for global use
const API_BASE_URL = "https://localhost:52389/";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Track if a refresh is in progress to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop: if the refresh endpoint itself fails, don't try to refresh again
    if (originalRequest?.url?.includes('/token/refresh')) {
      console.log('Refresh token endpoint failed, redirecting to signin');
      localStorage.removeItem('token');
      processQueue(error);
      window.location.href = '/signin';
      return Promise.reject(error);
    }
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Helper function to handle refresh token failure and redirect
      const handleRefreshFailure = (error: any) => {
        localStorage.removeItem('token');
        processQueue(error);
        window.location.href = '/signin';
      };

      try {
        // Attempt to refresh the token
        const accessToken = localStorage.getItem("token");
        const res = await api.post(
          '/api/v1/token/refresh',
          { token: accessToken },
          { withCredentials: true }
        );
        
        // Check if status code is not 200, redirect to signin
        console.log('Token refresh response', res);
        if (res.status !== 200) {
          console.log('Token refresh failed with status', res.status);
          handleRefreshFailure(new Error(`Token refresh failed with status ${res.status}`));
          return Promise.reject(error);
        }
        
        const newAccessToken = res.data?.accessToken;
        if (!newAccessToken || typeof newAccessToken !== 'string') {
          // No valid token returned, redirect to signin
          handleRefreshFailure(new Error('No access token returned'));
          return Promise.reject(error);
        }
        
        // Success - token is valid
        localStorage.setItem('token', newAccessToken);
        // Update the current instance headers
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        
        // Process queued requests
        processQueue(null, newAccessToken);
        
        return api(originalRequest);
      } catch (refreshError: any) {
        // ANY error from refresh endpoint (network, HTTP error, etc.) - redirect to signin
        console.log('Token refresh error caught', refreshError);
        if (refreshError.response) {
          const status = refreshError.response.status;
          console.log('Token refresh failed with status', status);
        }
        handleRefreshFailure(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api; 