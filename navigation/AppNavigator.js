// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import DetailsScreen from '../screens/DetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LoadingScreen from '../screens/LoadingScreen'; // 1. Importar a nova tela
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
    // 2. Usar o novo 'authStatus' para controlar a navegação
    const { authStatus, isLoading } = useAuth();
    const { colors } = useTheme();

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {authStatus === 'loggedIn' ? (
                    <>
                        <Stack.Screen name="Main" component={MainScreen} />
                        <Stack.Screen name="Details" component={DetailsScreen} />
                        <Stack.Screen name="History" component={HistoryScreen} />
                    </>
                ) : authStatus === 'authenticating' ? (
                    // 3. Mostrar a tela de Loading quando estiver autenticando
                    <Stack.Screen name="Loading" component={LoadingScreen} />
                ) : (
                    // 4. Mostrar a tela de Login quando estiver deslogado
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default AppNavigator;