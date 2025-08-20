// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

const MINIMUM_LOADING_TIME = 3000; // 3 segundos (mesma duração da animação)

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [authStatus, setAuthStatus] = useState('loggedOut');

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const sessionData = await AsyncStorage.getItem('userSession');
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    setUserSession(parsedData.userSession);
                    setPermissions(parsedData.permissions);
                    setWarehouses(parsedData.warehouses);
                    setAuthStatus('loggedIn');
                } else {
                    setAuthStatus('loggedOut');
                }
            } catch (e) {
                console.error("Falha ao restaurar sessão:", e);
                setAuthStatus('loggedOut');
            } finally {
                setIsLoading(false);
            }
        };
        api.initializeApiUrl().then(checkLogin);
    }, []);

    useEffect(() => {
        const fetchAppData = async () => {
            if (authStatus === 'authenticating') {
                try {
                    // Promessa para o carregamento dos dados
                    const dataPromise = (async () => {
                        const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
                        const sessionToSave = { userSession, permissions: perms, warehouses: whs };
                        await AsyncStorage.setItem('userSession', JSON.stringify(sessionToSave));
                        setPermissions(perms);
                        setWarehouses(whs);
                    })();

                    // Promessa para garantir a duração mínima da animação
                    const minTimePromise = new Promise(resolve => setTimeout(resolve, MINIMUM_LOADING_TIME));

                    // Espera ambas as promessas terminarem
                    await Promise.all([dataPromise, minTimePromise]);

                    setAuthStatus('loggedIn');
                } catch (error) {
                    handleApiError(error);
                    await logout();
                }
            }
        };
        fetchAppData();
    }, [authStatus]);

    const login = async (username, password) => {
        setApiError(null);
        try {
            const response = await api.login(username, password);
            setUserSession(response);

            // Apenas muda o estado, o useEffect acima cuidará do resto
            setAuthStatus('authenticating');
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error("Erro no logout:", error.message);
        } finally {
            setUserSession(null);
            setPermissions(null);
            setWarehouses([]);
            setAuthStatus('loggedOut');
            await AsyncStorage.removeItem('userSession');
        }
    };

    const handleApiError = (error) => {
        if (error.response && error.response.status === 401) {
            setApiError("Sua sessão expirou. Por favor, faça login novamente.");
        } else {
            setApiError(error.message || 'Ocorreu um erro inesperado.');
        }
    };

    const value = {
        userSession,
        permissions,
        warehouses,
        isLoading,
        authStatus,
        apiError,
        clearApiError: () => setApiError(null),
        login,
        logout,
        handleApiError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);