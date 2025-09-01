// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal';
import { LogBox, View } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import TestBanner from './components/common/TestBanner';
// 1. Importe o SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const AppContent = () => {
  const { userSession, apiError, clearApiError } = useAuth();
  const { theme, colors } = useTheme();

  if (!colors) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

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
    // 2. Envolva tudo com o SafeAreaProvider
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}