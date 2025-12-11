import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getToken } from '../api/auth';
import { setUnauthorizedHandler } from '../api/httpClient';
import { clearAccessToken, setAccessToken } from '../api/tokenStorage';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => getToken());

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast.error('Session expired. Please sign in again.');
    });
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLogin({ email, password });
    setAccessToken(result.access_token);
    setToken(result.access_token);
    toast.success('Signed in successfully');
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await apiRegister({ email, password, name });
    setAccessToken(result.access_token);
    setToken(result.access_token);
    toast.success('Account created');
  };

  const logout = () => {
    apiLogout();
    clearAccessToken();
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
