// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

const MINIMUM_LOADING_TIME = 3000;
const LAST_WAREHOUSES_KEY = 'lastUsedWarehouses';
const LAST_USERNAME_KEY = 'lastUsername';

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [authStatus, setAuthStatus] = useState('loggedOut');
    const [lastWarehouse, setLastWarehouse] = useState(null);
    const [lastUsername, setLastUsername] = useState('');

    const loadLastWarehouseForUser = async (codusu) => {
        try {
            const storedData = await AsyncStorage.getItem(LAST_WAREHOUSES_KEY);
            const warehousesMap = storedData ? JSON.parse(storedData) : {};
            setLastWarehouse(warehousesMap[codusu] || null);
        } catch (e) { console.error("Falha ao carregar último armazém:", e); }
    };
    
    const loadLastUsername = async () => {
        try {
            const username = await AsyncStorage.getItem(LAST_USERNAME_KEY);
            if (username) {
                setLastUsername(username);
            }
        } catch (e) { console.error("Falha ao carregar último usuário:", e); }
    };

    useEffect(() => {
        const checkLogin = async () => {
            try {
                await Promise.all([loadLastUsername(), (async () => {
                    const sessionData = await AsyncStorage.getItem('userSession');
                    if (sessionData) {
                        const parsedData = JSON.parse(sessionData);
                        setUserSession(parsedData.userSession);
                        setPermissions(parsedData.permissions);
                        setWarehouses(parsedData.warehouses);
                        await loadLastWarehouseForUser(parsedData.userSession.codusu);
                        setAuthStatus('loggedIn');
                    } else {
                        setAuthStatus('loggedOut');
                    }
                })()]);
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
            if (authStatus === 'authenticating' && userSession) {
                try {
                    const dataPromise = (async () => {
                        const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
                        const sessionToSave = { userSession, permissions: perms, warehouses: whs };
                        await AsyncStorage.setItem('userSession', JSON.stringify(sessionToSave));
                        setPermissions(perms);
                        setWarehouses(whs);
                        await loadLastWarehouseForUser(userSession.codusu);
                    })();

                    const minTimePromise = new Promise(resolve => setTimeout(resolve, MINIMUM_LOADING_TIME));
                    await Promise.all([dataPromise, minTimePromise]);
                    setAuthStatus('loggedIn');
                } catch (error) {
                    handleApiError(error);
                    // O logout já é chamado dentro de handleApiError, se necessário
                }
            }
        };
        fetchAppData();
    }, [authStatus, userSession]);

    const login = async (username, password) => {
        setApiError(null);
        try {
            const response = await api.login(username, password);
            await AsyncStorage.setItem(LAST_USERNAME_KEY, username);
            setLastUsername(username);
            setUserSession(response);
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
            setLastWarehouse(null);
            setAuthStatus('loggedOut');
            await AsyncStorage.removeItem('userSession');
        }
    };

    const saveLastWarehouse = async (codusu, warehouseCode) => {
        try {
            const storedData = await AsyncStorage.getItem(LAST_WAREHOUSES_KEY);
            const warehousesMap = storedData ? JSON.parse(storedData) : {};
            warehousesMap[codusu] = warehouseCode;
            await AsyncStorage.setItem(LAST_WAREHOUSES_KEY, JSON.stringify(warehousesMap));
        } catch (e) {
            console.error("Falha ao salvar último armazém:", e);
        }
    };

    const handleApiError = (error) => {
        // --- LÓGICA DE AUTO-LOGOUT ---
        // Verifica se a resposta de erro contém a flag 'reauthRequired'
        if (error.response?.data?.reauthRequired) {
            // Define a mensagem de erro específica para o modal
            setApiError(error.response.data.message || "Sua sessão expirou. Faça o login novamente.");
            // Executa o logout para limpar a sessão e redirecionar para a tela de login
            logout();
        } else {
            // Para todos os outros erros, exibe a mensagem padrão
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
        lastWarehouse,
        saveLastWarehouse,
        lastUsername,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);