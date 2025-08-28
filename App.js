// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal';
import { LogBox, StatusBar } from 'react-native';
import { useFonts } from 'expo-font'; // 1. Importar useFonts

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const AppContent = () => {
  const { apiError, clearApiError } = useAuth();
  const { theme } = useTheme();

  return (
    <>
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={colors.primary} 
      />
      <AppNavigator />
      <ErrorModal
        visible={!!apiError}
        errorMessage={apiError}
        onClose={clearApiError}
      />
    </>
  );
}

export default function App() {
  // 2. Carregar a fonte personalizada
  const [fontsLoaded] = useFonts({
    'Zenith-Regular': require('./assets/fonts/Zenith-Regular.otf'),
  });

  // 3. Garantir que o app só seja renderizado após a fonte carregar
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}