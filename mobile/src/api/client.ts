import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

export const setApiToken = (token: string | null) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

export const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || (error?.message === 'Network Error' ? 'Cannot reach the server' : fallback);
