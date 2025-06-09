import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserData: () => Promise<void>;
}

interface LoginResponse {
  token: string;
  user: any;
  message?: string;
}

interface UserResponse {
  user: any;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axiosInstance.get<UserResponse>('/user');
        if (response.data && response.data.user) {
          setUser(response.data.user);
      setIsAuthenticated(true);
        } else {
          logout();
        }
    } catch (error) {
      logout();
    }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUserData().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post<LoginResponse>('/login', {
        username,
        password,
      });

      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
      } else {
        throw new Error(response.data.message || 'Login failed: No token or user data received');
      }
    } catch (error: any) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(error.response?.data?.message || error.message || 'An unknown login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    const baseUrl = import.meta.env.BASE_URL || '/';
    navigate(`${baseUrl}auth/login`);
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 