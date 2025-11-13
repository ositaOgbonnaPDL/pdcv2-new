import axios, {AxiosResponse} from 'axios';
import {unstable_batchedUpdates} from 'react-native';
import {login, refreshToken} from './services/authentication';
import authStore from './stores/auth';
import {baseURL} from './utils';

const http = axios.create({baseURL});

http.interceptors.request.use((request) => {
  const {token} = authStore.getState();
  request.headers.Authorization = `Bearer ${token}`;
  return request;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const {status} = error.response ?? {};
    const {setAuth, isAuthenticated} = authStore.getState();

    // If request failure is due to expired token,
    // attempt to refresh the token. And then retry the
    // original failed request.
    if (!originalRequest._retry && status === 401 && isAuthenticated) {
      originalRequest._retry = true;

      try {
        let {token, ...data} = await refreshToken();

        unstable_batchedUpdates(() => {
          setAuth({token, refreshToken: data.refreshToken});
        });
      } catch (err) {
        const {status} = (err as any)?.response?.data;

        // if for any reason the server is still rejecting our request, maybe
        // because of failure to get a new token because refresh token has expired
        if (status === 1) {
          try {
            const {username, password} = authStore.getState();

            const {token, refreshToken} = await login({username, password});

            unstable_batchedUpdates(() => {
              setAuth({token, refreshToken});
            });
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }

      return http(originalRequest);
    }

    return Promise.reject(error);
  },
);

const getData = async <returnType>(
  promise: Promise<AxiosResponse<returnType>>,
) => {
  const res = await promise;
  return res?.data;
};

export const get = <returnType = any>(url: string) => {
  return getData<returnType>(http.get(url));
};

export const post = <bodyType = any, returnType = any>(url: string) => {
  return (body: bodyType) => {
    return getData<returnType>(http.post(url, body));
  };
};

export const put = <bodyType = any, returnType = any>(url: string) => {
  return (body: bodyType) => {
    return getData<returnType>(http.put(url, body));
  };
};

export default http;
