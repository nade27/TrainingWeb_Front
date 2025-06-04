import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Mengembalikan baseURL ke port 3000 dan tanpa /api
});

// Request interceptor untuk menambahkan token ke header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = {}; // Inisialisasi jika belum ada
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk menangani error global (seperti 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect ke halaman login menggunakan path absolut
      const loginPath = import.meta.env.BASE_URL + 'auth/login';
      // Periksa apakah kita sudah di halaman login (atau variasinya karena BASE_URL)
      if (window.location.pathname !== loginPath.replace(/\/$/, '')) { // Hapus trailing slash jika ada untuk perbandingan
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 