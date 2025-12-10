import { apiClient } from './httpClient';
import { clearAccessToken, getAccessToken, setAccessToken } from './tokenStorage';

export interface AuthResponse {
  access_token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/users/register', payload);
  setAccessToken(data.access_token);
  return data;
};

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/users/login', payload);
  setAccessToken(data.access_token);
  return data;
};

export const logout = () => {
  clearAccessToken();
};

export const getToken = (): string | null => getAccessToken();
