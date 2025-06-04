import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  token: string;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[Auth Hook] useEffect running. Token from localStorage:', token);
    if (token) {
      console.log('[Auth Hook] useEffect: Token found, calling fetchUserData.');
      fetchUserData()
        .catch((error) => {
          console.error("Error during initial user data fetch:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    console.log('[Auth Hook] fetchUserData called.');
    try {
      console.log('[Auth Hook] fetchUserData: Attempting GET /user.');
      const response = await axiosInstance.get('/user');
      console.log('[Auth Hook] fetchUserData: GET /user successful, response:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[Auth Hook] fetchUserData: Error fetching user data:', error);
      console.log('[Auth Hook] fetchUserData: Calling logout() due to error.');
      logout();
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    console.log('[Auth Hook] Attempting login for:', username);
    try {
      const loginResponse = await axiosInstance.post<LoginResponse>('/login', {
        username,
        password,
      });

      console.log('[Auth Hook] Login response received from backend:', loginResponse);
      console.log('[Auth Hook] Login response.data:', loginResponse.data);

      const { token } = loginResponse.data;

      console.log('[Auth Hook] Extracted token:', token);

      if (!token) {
        console.error('[Auth Hook] Token not found in loginResponse.data');
        throw new Error('Token tidak ditemukan dalam response login');
      }

      console.log('[Auth Hook] Attempting to set token in localStorage:', token);
      localStorage.setItem('token', token);
      const storedToken = localStorage.getItem('token');
      console.log('[Auth Hook] Token retrieved from localStorage after setItem:', storedToken);
      console.log('[Auth Hook] Login successful, token stored. Calling fetchUserData to confirm session.');

      await fetchUserData();

      console.log('[Auth Hook] fetchUserData successful after login. Current isAuthenticated state:', isAuthenticated, 'Navigating to /dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('[Auth Hook] Login process error caught:', error);
      if (error.response) {
        console.error('[Auth Hook] Login process error response data:', error.response.data);
        console.error('[Auth Hook] Login process error response status:', error.response.status);
      }
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(error.response?.data?.message || error.message || 'Terjadi kesalahan saat proses login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth Hook] logout() called.');
    const tokenBeforeRemove = localStorage.getItem('token');
    console.log('[Auth Hook] logout: Token in localStorage before remove:', tokenBeforeRemove);
    localStorage.removeItem('token');
    const tokenAfterRemove = localStorage.getItem('token');
    console.log('[Auth Hook] logout: Token in localStorage after remove:', tokenAfterRemove);
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
    console.log('[Auth Hook] logout: Navigating to /auth/login.');
    navigate('/auth/login');
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
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