import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // backend berjalan di port 3000
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Axios Interceptor Request: Token from localStorage:', token);
    console.log('Axios Interceptor Request: Requesting URL:', config.url);
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Axios Interceptor Request: Authorization header set for', config.url);
    } else {
      console.log('Axios Interceptor Request: No token found or no headers object for', config.url);
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios Interceptor Response Error:', error.config?.url, error.response?.status, error.message);
    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      console.log('Axios Interceptor Response: Unauthorized (401). Redirecting to login.');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 