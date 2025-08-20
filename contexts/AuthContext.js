// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Loading inicial do app
    const [apiError, setApiError] = useState(null);
    // Novo estado para controlar o fluxo de navegação
    const [authStatus, setAuthStatus] = useState('loggedOut'); // 'loggedOut', 'authenticating', 'loggedIn'

    // Efeito para carregar a sessão salva ao iniciar o app
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const sessionData = await AsyncStorage.getItem('userSession');
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    setUserSession(parsedData.userSession);
                    setPermissions(parsedData.permissions);
                    setWarehouses(parsedData.warehouses);
                    setAuthStatus('loggedIn'); // Se encontrou sessão, já está logado
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

    // Efeito que busca os dados após a confirmação do login
    useEffect(() => {
        const fetchAppData = async () => {
            if (authStatus === 'authenticating') {
                try {
                    const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
                    
                    const sessionToSave = { userSession, permissions: perms, warehouses: whs };
                    await AsyncStorage.setItem('userSession', JSON.stringify(sessionToSave));
                    
                    setPermissions(perms);
                    setWarehouses(whs);
                    setAuthStatus('loggedIn'); // Dados carregados, pode ir para a MainScreen
                } catch (error) {
                    handleApiError(error);
                    await logout(); // Se falhar ao buscar dados, desloga
                }
            }
        };
        fetchAppData();
    }, [authStatus]);

    const login = async (username, password) => {
        setApiError(null);
        try {
            // Etapa 1: Validar credenciais
            const response = await api.login(username, password);
            setUserSession(response); // Guarda a sessão do usuário
            setAuthStatus('authenticating'); // Muda o estado para iniciar o carregamento dos dados
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
        authStatus, // Expor o novo estado para o AppNavigator
        apiError,
        clearApiError: () => setApiError(null),
        login,
        logout,
        handleApiError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);