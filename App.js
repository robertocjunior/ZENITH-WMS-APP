// App.js
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';

// Ignora um aviso comum com o Picker que não afeta a funcionalidade
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}