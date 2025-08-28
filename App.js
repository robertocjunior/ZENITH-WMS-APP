// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal';
import { LogBox, View } from 'react-native'; // Importe a View
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const AppContent = () => {
  const { apiError, clearApiError } = useAuth();
  const { theme, colors } = useTheme();

  // =================================================================
  // CORREÇÃO: Garante que as cores foram carregadas antes de usar
  // =================================================================
  if (!colors) {
    // Renderiza um fundo vazio enquanto o tema carrega para evitar o crash
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

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
  const [fontsLoaded] = useFonts({
    'Zenith-Regular': require('./assets/fonts/Zenith-Regular.otf'),
  });

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