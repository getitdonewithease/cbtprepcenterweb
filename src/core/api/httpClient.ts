import axios, { InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/core/auth/tokenStorage";
import { AppError, ServerError, mapAxiosErrorToAppError } from "@/core/errors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined. Please set it in your environment file.");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Track if a refresh is in progress to prevent multiple simultaneous refresh requests
let isRefreshing = false;
type RefreshQueueItem = {
  resolve: (value: string | null) => void;
  reject: (reason: AppError) => void;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let failedQueue: RefreshQueueItem[] = [];

const setAuthorizationHeader = (config: RetryableRequestConfig, token: string): void => {
  const headers = axios.AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
};

const mapUnknownToAppError = (error: unknown, fallbackMessage: string): AppError => {
  if (axios.isAxiosError(error)) {
    return mapAxiosErrorToAppError(error);
  }

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new ServerError(error.message, undefined, error);
  }

  return new ServerError(fallbackMessage, undefined, error);
};

const processQueue = (error: AppError | null, token: string | null = null) => {
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
    const token = getAccessToken();
    if (token) {
      const headers = axios.AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(mapUnknownToAppError(error, "Request setup failed."));
  }
);

// Add a response interceptor for handling 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const mappedIncomingError = mapUnknownToAppError(error, "Request failed.");

    if (!axios.isAxiosError(error)) {
      return Promise.reject(mappedIncomingError);
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;
    
    // Prevent infinite loop: if the refresh endpoint itself fails, don't try to refresh again
    if (originalRequest?.url?.includes('/token/refresh')) {
      clearAccessToken();
      processQueue(mappedIncomingError);
      window.location.href = '/signin';
      return Promise.reject(mappedIncomingError);
    }
    
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            setAuthorizationHeader(originalRequest, token);
          }
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Helper function to handle refresh token failure and redirect
      const handleRefreshFailure = (refreshFailure: AppError) => {
        clearAccessToken();
        processQueue(refreshFailure);
        window.location.href = '/signin';
      };

      try {
        // Attempt to refresh the token
        const accessToken = getAccessToken();
        const res = await api.post(
          '/api/v1/token/refresh',
          { token: accessToken },
          { withCredentials: true }
        );
        
        if (res.status !== 200) {
          const refreshStatusError = new ServerError(`Token refresh failed with status ${res.status}`, {
            statusCode: res.status,
            path: '/api/v1/token/refresh',
          });
          handleRefreshFailure(refreshStatusError);
          return Promise.reject(refreshStatusError);
        }
        
        const newAccessToken = res.data?.accessToken;
        if (!newAccessToken || typeof newAccessToken !== 'string') {
          const invalidRefreshTokenError = new ServerError('No access token returned', {
            statusCode: res.status,
            path: '/api/v1/token/refresh',
          });
          handleRefreshFailure(invalidRefreshTokenError);
          return Promise.reject(invalidRefreshTokenError);
        }
        
        // Success - token is valid
        setAccessToken(newAccessToken);
        // Update the current instance headers
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        setAuthorizationHeader(originalRequest, newAccessToken);
        
        // Process queued requests
        processQueue(null, newAccessToken);
        
        return api(originalRequest);
      } catch (refreshError: unknown) {
        const mappedRefreshError = mapUnknownToAppError(
          refreshError,
          'Token refresh failed unexpectedly.',
        );
        handleRefreshFailure(mappedRefreshError);
        return Promise.reject(mappedRefreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(mappedIncomingError);
  }
);

export default api;
