// App.js
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal';
import { LogBox, View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import TestBanner from './components/common/TestBanner';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// NOVO: Importa o novo modal
import ReAuthModal from './components/modals/ReAuthModal';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const AppContent = () => {
  // ALTERADO: Pega os novos estados e funções do AuthContext
  const { userSession, apiError, clearApiError, isReAuthVisible, handleReAuth, cancelReAuth } = useAuth();
  const { theme, colors } = useTheme();
  // NOVO: Estado de loading para o botão do ReAuthModal
  const [isReAuthLoading, setIsReAuthLoading] = useState(false);

  if (!colors) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  // NOVO: Função para encapsular a confirmação da re-autenticação
  const onReAuthConfirm = async (password) => {
      setIsReAuthLoading(true);
      const success = await handleReAuth(password);
      if (!success) {
          setIsReAuthLoading(false);
      }
      // Se tiver sucesso, o loading para quando a requisição original terminar
  };

  return (
    <View style={{ flex: 1 }}>
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
      {/* NOVO: Renderiza o modal de re-autenticação globalmente */}
      <ReAuthModal
          visible={isReAuthVisible}
          onConfirm={onReAuthConfirm}
          onCancel={cancelReAuth}
          loading={isReAuthLoading}
      />
      {userSession?.isTestEnvironment && <TestBanner />}
    </View>
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
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}