// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api'; // Importa seu arquivo api/index.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    // Este useEffect carrega a sessão salva ao iniciar o app
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const sessionData = await AsyncStorage.getItem('userSession');
                if (sessionData) {
                    setUserSession(JSON.parse(sessionData));
                    // Não precisamos chamar setAuthHeader, sua API já lida com isso.
                    
                    const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
                    setPermissions(perms);
                    setWarehouses(whs);
                }
            } catch (e) {
                console.error("Falha ao restaurar sessão:", e);
                // Se der erro ao carregar os dados, limpa tudo por segurança
                await logout();
            } finally {
                setIsLoading(false);
            }
        };
        // Inicializa a URL da API primeiro, depois verifica o login
        api.initializeApiUrl().then(checkLogin);
    }, []);

    const login = async (username, password) => {
        // Envolvemos a sua lógica original de login com o try...catch
        try {
            // A função api.login já salva o token e a sessão no AsyncStorage
            const response = await api.login(username, password);
            setUserSession(response);

            // Após o login, buscamos as permissões e armazéns
            const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
            setPermissions(perms);
            setWarehouses(whs);

        } catch (error) {
            // Se api.login falhar, chamamos nosso modal de erro!
            handleApiError(error);
            // E relançamos o erro para a LoginScreen parar o "loading"
            throw error;
        }
    };

    const logout = async () => {
        try {
            // A api.logout já remove o token do AsyncStorage
            await api.logout();
        } catch (error) {
            console.error("Erro no logout:", error.message);
        } finally {
            // Apenas limpamos o estado no contexto
            setUserSession(null);
            setPermissions(null);
            setWarehouses([]);
        }
    };

    const handleApiError = (error) => {
        // Se o erro for de token inválido (401), desloga o usuário
        if (error.message === '401') {
            logout();
        } else {
            // Para outros erros, define a mensagem para o nosso modal
            setApiError(error.message || 'Ocorreu um erro inesperado.');
        }
    };
    
    // As outras funções permanecem como estavam
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