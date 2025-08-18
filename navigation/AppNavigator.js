// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import DetailsScreen from '../screens/DetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
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

export default AppNavigator;