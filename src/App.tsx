import { BrowserRouter, useRoutes } from "react-router-dom";
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import { AuthProvider } from './hooks/useAuth';
import AppRoutesConfig from "./routes/Router";

// Komponen baru untuk menggunakan useRoutes di dalam BrowserRouter
const RoutesComponent = () => {
  const routes = AppRoutesConfig(); // Panggil fungsi untuk mendapatkan konfigurasi
  const element = useRoutes(routes); // Gunakan useRoutes
  return element;
};

function App() {
  return (
    <>
      <ThemeModeScript />
      <Flowbite theme={{ theme: customTheme }}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <RoutesComponent /> {/* Gunakan komponen baru di sini */}
          </AuthProvider>
        </BrowserRouter>
      </Flowbite>
    </>
  );
}

export default App;
