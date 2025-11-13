/**
 * HTTP Client with Axios
 * Configured with authentication interceptors and token refresh
 */

import axios, {AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {unstable_batchedUpdates} from 'react-native';
import useAuthStore from '../stores/authStore';
import {baseURL} from '../utils/constants';

// Create axios instance
const http = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const {token} = useAuthStore.getState();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle token refresh on 401
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const {setAuth, isAuthenticated, refreshToken} = useAuthStore.getState();

    // If request failure is due to expired token, attempt to refresh
    if (!originalRequest._retry && status === 401 && isAuthenticated) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const {data} = await axios.post(
          `${baseURL}/auth/refresh`,
          null,
          {
            params: {token: refreshToken},
          },
        );

        unstable_batchedUpdates(() => {
          setAuth({
            token: data.token,
            refreshToken: data.refreshToken,
          });
        });

        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
        }

        return http(originalRequest);
      } catch (refreshError: any) {
        const refreshStatus = refreshError.response?.data?.status;

        // If refresh token also expired, try to re-login with saved credentials
        if (refreshStatus === 1) {
          try {
            const {username, password} = useAuthStore.getState();

            if (username && password) {
              const {data} = await axios.post(`${baseURL}/auth/signin`, {
                username,
                password,
              });

              unstable_batchedUpdates(() => {
                setAuth({
                  token: data.token,
                  refreshToken: data.refreshToken,
                });
              });

              // Retry the original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${data.token}`;
              }

              return http(originalRequest);
            }
          } catch (loginError) {
            // If re-login fails, reject the promise
            return Promise.reject(loginError);
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to extract data from response
const getData = async <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  const res = await promise;
  return res?.data;
};

// HTTP method wrappers
export const get = <T = any>(url: string) => {
  return getData<T>(http.get(url));
};

export const post = <TBody = any, TReturn = any>(url: string) => {
  return (body: TBody) => {
    return getData<TReturn>(http.post(url, body));
  };
};

export const put = <TBody = any, TReturn = any>(url: string) => {
  return (body: TBody) => {
    return getData<TReturn>(http.put(url, body));
  };
};

export const del = <T = any>(url: string) => {
  return getData<T>(http.delete(url));
};

export default http;
