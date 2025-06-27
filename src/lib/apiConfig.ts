import axios from "axios";

// API configuration for global use
const API_BASE_URL = "https://cbtprepcenter-a8fwbpb8g7fzcjcr.westeurope-01.azurewebsites.net/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

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
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token
        const accessToken = localStorage.getItem("token");
        const res = await axios.post(
          '/api/v1/token/refresh',
          { token: accessToken },
          { withCredentials: true, baseURL: API_BASE_URL }
        );
        const newAccessToken = res.data.accessToken;
        if (newAccessToken) {
          localStorage.setItem('token', newAccessToken);
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return api(originalRequest);
        } else {
          // No token returned, force login
          console.log(res)
          // window.location.href = '/signin';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed — redirect to login
        console.log(refreshError)
        // window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 