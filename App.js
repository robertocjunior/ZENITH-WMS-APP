// App.js
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorModal from './components/common/ErrorModal'; // <-- Importe o novo modal
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// Um componente wrapper para acessar o contexto
const AppContent = () => {
  const { apiError, clearApiError } = useAuth();
  return (
    <>
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}