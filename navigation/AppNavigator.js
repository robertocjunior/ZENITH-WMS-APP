// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext'; // 1. Importar o hook do tema

import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import DetailsScreen from '../screens/DetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme(); // 2. Obter as cores do contexto

    if (isLoading) {
        // O loading inicial do app também respeita o tema
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <>
                        <Stack.Screen name="Main" component={MainScreen} />
                        <Stack.Screen name="Details" component={DetailsScreen} />
                        <Stack.Screen name="History" component={HistoryScreen} />
                    </>
                ) : (
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