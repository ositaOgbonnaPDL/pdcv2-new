import axios from 'axios';
import authStore from '../stores/auth';
import {Credentials} from '../types';
import {baseURL} from '../utils';

type RoleType = 'ROLE_FIELDWORKER';

type Role = {authority: RoleType};

type Roles = Role[];

type Login = Omit<Credentials, 'token' | 'refreshToken' | 'rememberMe'>;

const isFieldWorker = (roles: Roles) => {
  return roles.some(({authority}) => {
    return authority === 'ROLE_FIELDWORKER';
  });
};

const msg = 'Only fieldworkers are allowed to use the mobile app.';

export const login = async (credentials: Login) => {
  try {
    const {data} = await axios.post(`${baseURL}/auth/signin`, credentials);

    const {roles, ...rest} = data;

    if (!isFieldWorker(roles as Roles)) throw new Error(msg);

    return rest;
  } catch (e) {
    const rsp = (e as any).response?.data;
    const message = rsp?.message ?? rsp?.error;
    throw new Error(message ?? 'There was an error');
  }
};

export async function refreshToken(): Promise<
  Omit<Credentials, 'username' | 'password'>
> {
  const state = authStore.getState();
  const url = `${baseURL}/auth/refresh`;
  const params = {token: state.refreshToken};
  const {data} = await axios.post(url, null, {params});
  return data;
}
