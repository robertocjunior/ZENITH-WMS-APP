// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

const MINIMUM_LOADING_TIME = 3000;
const LAST_WAREHOUSES_KEY = 'lastUsedWarehouses';
const LAST_USERNAME_KEY = 'lastUsername'; // Nova chave para o AsyncStorage

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [authStatus, setAuthStatus] = useState('loggedOut');
    const [lastWarehouse, setLastWarehouse] = useState(null);
    const [lastUsername, setLastUsername] = useState(''); // Novo estado para o nome de usuário

    const loadLastWarehouseForUser = async (codusu) => {
        try {
            const storedData = await AsyncStorage.getItem(LAST_WAREHOUSES_KEY);
            const warehousesMap = storedData ? JSON.parse(storedData) : {};
            setLastWarehouse(warehousesMap[codusu] || null);
        } catch (e) { console.error("Falha ao carregar último armazém:", e); }
    };
    
    // Nova função para carregar o último nome de usuário
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
                // Carrega o último usuário e a sessão em paralelo para agilizar
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
                    await logout();
                }
            }
        };
        fetchAppData();
    }, [authStatus, userSession]);

    const login = async (username, password) => {
        setApiError(null);
        try {
            const response = await api.login(username, password);
            // Salva o nome de usuário após o sucesso do login
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
            // O último nome de usuário NÃO é limpo no logout
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
        lastWarehouse,
        saveLastWarehouse,
        lastUsername, // Expondo o último nome de usuário
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);