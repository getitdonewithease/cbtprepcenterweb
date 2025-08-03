import axios from "axios";

// API configuration for global use
const API_BASE_URL = "https://localhost:51420/";

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

      try {
        // Attempt to refresh the token
        const accessToken = localStorage.getItem("token");
        const res = await api.post(
          '/api/v1/token/refresh',
          { token: accessToken },
          { withCredentials: true }
        );
        
        const newAccessToken = res.data.accessToken;
        if (newAccessToken) {
          localStorage.setItem('token', newAccessToken);
          // Update the current instance headers
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          return api(originalRequest);
        } else {
          // No token returned, force login
          localStorage.removeItem('token');
          processQueue(new Error('No access token returned'));
          window.location.href = '/signin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed — redirect to login
        localStorage.removeItem('token');
        processQueue(refreshError);
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api; 