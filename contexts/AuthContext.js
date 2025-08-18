// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]); // <-- 1. Adicione o estado para os armazéns
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const token = await AsyncStorage.getItem('sessionToken');
                const session = await AsyncStorage.getItem('userSession');
                if (token && session) {
                    setUserSession(JSON.parse(session));
                    // Carrega permissões e armazéns ao iniciar
                    const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
                    setPermissions(perms);
                    setWarehouses(whs);
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

        // Carrega permissões e armazéns após o login
        const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
        setPermissions(perms);
        setWarehouses(whs);
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error("Erro no logout do servidor:", error.message);
        } finally {
            setUserSession(null);
            setPermissions(null);
            setWarehouses([]); // Limpa os armazéns no logout
            await AsyncStorage.removeItem('sessionToken');
            await AsyncStorage.removeItem('userSession');
        }
    };
    
    const refreshPermissions = async () => {
        try {
            const perms = await api.fetchPermissions();
            setPermissions(perms);
            console.log('Permissões atualizadas:', perms);
        } catch (error) {
            console.error('Falha ao atualizar permissões:', error.message);
            handleApiError(error);
        }
    };

    const handleApiError = (error) => {
        if (error.message === '401') {
            logout();
        } else {
            setApiError(error.message);
        }
    };

    const value = {
        userSession,
        permissions,
        warehouses, // <-- 2. Exponha os armazéns
        isLoading,
        isAuthenticated: !!userSession,
        apiError,
        clearApiError: () => setApiError(null),
        login,
        logout,
        handleApiError,
        refreshPermissions,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);