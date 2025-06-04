import { BrowserRouter } from "react-router-dom";
import { Flowbite, ThemeModeScript } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import { AuthProvider } from './hooks/useAuth';
import AppRoutes from "./routes/Router";

function App() {
  return (
    <>
      <ThemeModeScript />
      <Flowbite theme={{ theme: customTheme }}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </Flowbite>
    </>
  );
}

export default App;
