import { Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Spinner from "./components/ui/Spinner";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./hooks/useTheme";
import { SettingProvider } from './contexts/SettingContext';

const AppToaster = () => {
  const { theme } = useTheme();

  const toastOptions =
    theme === 'dark'
      ? {
          style: {
            background: '#374151', // gray-700
            color: '#F3F4F6', // gray-100
          },
        }
      : {
          style: {
            background: '#FFFFFF', // white
            color: '#1F2937', // gray-800
          },
        };

  return (
    <Toaster
      position="top-right"
      toastOptions={toastOptions}
    />
  );
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {' '}
      {/* ThemeProvider needs to wrap AuthProvider if AuthProvider uses useTheme, or wrap AppToaster directly */}
      <AuthProvider>
        <SettingProvider>
          <AppToaster />
          <Suspense fallback={<Spinner />}>{children}</Suspense>
        </SettingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}