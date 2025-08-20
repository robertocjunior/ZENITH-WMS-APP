// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; // Importe o ThemeProvider
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal';
import LoadingOverlay from './components/common/LoadingOverlay';
import { LogBox, StatusBar } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// Um componente wrapper para acessar os contextos
const AppContent = () => {
  const { apiError, clearApiError, loading } = useAuth();
  const { theme } = useTheme(); // Pega o tema atual (dark ou light)

  return (
    <>
      {/* A StatusBar agora se adapta ao tema! */}
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <AppNavigator />
      <ErrorModal
        visible={!!apiError}
        errorMessage={apiError}
        onClose={clearApiError}
      />
      <LoadingOverlay visible={loading} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}