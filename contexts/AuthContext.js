// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const token = await AsyncStorage.getItem('sessionToken');
                const session = await AsyncStorage.getItem('userSession');
                if (token && session) {
                    setUserSession(JSON.parse(session));
                    const perms = await api.fetchPermissions();
                    setPermissions(perms);
                }
            } catch (e) {
                console.error("Falha ao verificar sessão:", e);
                await logout();
            } finally {
                setIsLoading(false);
            }
        };
        checkLogin();
    }, []);

    const login = async (username, password) => {
        const response = await api.login(username, password);
        setUserSession(response);
        await AsyncStorage.setItem('userSession', JSON.stringify(response));
        const perms = await api.fetchPermissions();
        setPermissions(perms);
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error("Erro no logout do servidor:", error.message);
        } finally {
            setUserSession(null);
            setPermissions(null);
            await AsyncStorage.removeItem('sessionToken');
            await AsyncStorage.removeItem('userSession');
        }
    };

    const handleApiError = (error) => {
        if (error.message === '401') {
            logout();
        }
    };

    const value = {
        userSession,
        permissions,
        isLoading,
        isAuthenticated: !!userSession,
        login,
        logout,
        handleApiError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);