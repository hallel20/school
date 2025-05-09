import { createContext, useState, ReactNode } from 'react';
import useSession from '../hooks/useSession';
import { User } from '../types';
import api from '../services/api';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = getCookie('token') || localStorage.getItem('token');
  const {
    session: { user },
    refetch,
  } = useSession();

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;
      setCookie('token', token);
      localStorage.setItem('token', token);
      refetch();
    } catch (err: Error | any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    deleteCookie('token');
    window.location.href = '/login';
  };

  const storageUser = localStorage.getItem('user');
  let fallBackUser;
  if (storageUser) {
    fallBackUser = JSON.parse(storageUser);
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || fallBackUser,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
