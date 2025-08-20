// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal';
// LoadingOverlay não é mais importado para o fluxo de login
import { LogBox, StatusBar } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const AppContent = () => {
  const { apiError, clearApiError } = useAuth();
  const { theme } = useTheme();

  return (
    <>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <AppNavigator />
      <ErrorModal
        visible={!!apiError}
        errorMessage={apiError}
        onClose={clearApiError}
      />
      {/* O LoadingOverlay foi removido daqui */}
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