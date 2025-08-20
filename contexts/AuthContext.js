// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api'; // Importa seu arquivo api/index.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Mantém o loading inicial do app
    const [loading, setLoading] = useState(false); // Novo loading para transições (login/logout)
    const [apiError, setApiError] = useState(null);

    // Este useEffect carrega a sessão salva ao iniciar o app
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const sessionData = await AsyncStorage.getItem('userSession');
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    // Restaura todos os dados da sessão salva
                    setUserSession(parsedData.userSession);
                    setPermissions(parsedData.permissions);
                    setWarehouses(parsedData.warehouses);
                }
            } catch (e) {
                console.error("Falha ao restaurar sessão:", e);
                await AsyncStorage.removeItem('userSession'); // Limpa dados corrompidos
            } finally {
                setIsLoading(false);
            }
        };
        api.initializeApiUrl().then(checkLogin);
    }, []);

    const login = async (username, password) => {
        // Não inicia o loading global aqui!
        setApiError(null); // Limpa erros anteriores
        try {
            const response = await api.login(username, password);
            setUserSession(response);

            const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
            setPermissions(perms);
            setWarehouses(whs);
            
            const sessionToSave = { userSession: response, permissions: perms, warehouses: whs };
            await AsyncStorage.setItem('userSession', JSON.stringify(sessionToSave));

            setLoading(true); // <-- Ativa o loading global APÓS o sucesso do login.

        } catch (error) {
            // setLoading já é false, então não precisa mudar.
            handleApiError(error);
            throw error;
        }
    };
    
    // Nova função para a MainScreen chamar quando estiver pronta
    const hideInitialLoading = () => {
        setLoading(false);
    };

    const logout = async () => {
        setLoading(true); // Ativa o loading durante o logout para uma melhor UX
        try {
            await api.logout();
        } catch (error) {
            console.error("Erro no logout:", error.message);
        } finally {
            setUserSession(null);
            setPermissions(null);
            setWarehouses([]);
            await AsyncStorage.removeItem('userSession');
            setLoading(false); // Desativa o loading ao final
        }
    };

    const handleApiError = (error) => {
        // Se o erro for de token inválido (401), desloga o usuário
        if (error.response && error.response.status === 401) {
            setApiError("Sua sessão expirou. Por favor, faça login novamente.");
            logout();
        } else {
            // Para outros erros, define a mensagem para o nosso modal
            setApiError(error.message || 'Ocorreu um erro inesperado.');
        }
    };
    
    const refreshPermissions = async () => {
        try {
            const perms = await api.fetchPermissions();
            setPermissions(perms);
        } catch (error) {
            handleApiError(error);
        }
    };

    const value = {
        userSession,
        permissions,
        warehouses,
        isLoading, // Loading inicial do app
        loading,   // Novo loading para transições
        hideInitialLoading, // Nova função para parar o loading
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