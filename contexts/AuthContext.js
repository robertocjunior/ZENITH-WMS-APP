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

    // NOVO: Estados para controlar o fluxo de re-autenticação
    const [isReAuthVisible, setIsReAuthVisible] = useState(false);
    const [requestToRetry, setRequestToRetry] = useState(null);

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
            setAuthStatus('authenticating'); // Isso irá acionar o useEffect acima para buscar dados
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
            // A remoção do storage já acontece dentro de api.logout()
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

    // ALTERADO: Lógica de erro completamente nova
    const handleApiError = (error, retryFunc = null) => {
        if (error.reauthRequired && retryFunc) {
            setRequestToRetry(() => () => retryFunc());
            setIsReAuthVisible(true);
        } else if (error.reauthRequired || error.message === '401') {
             setApiError("Sua sessão expirou. Por favor, faça login novamente.");
             logout();
        }
        else {
            setApiError(error.message || 'Ocorreu um erro inesperado.');
        }
    };

    // NOVO: Função para lidar com a confirmação do modal de re-autenticação
    const handleReAuth = async (password) => {
        const currentUsername = userSession?.username || lastUsername;
        if (!currentUsername) return false;

        try {
            const newSessionData = await api.login(currentUsername, password);
            const sessionToSave = { userSession: newSessionData, permissions, warehouses };
            await AsyncStorage.setItem('userSession', JSON.stringify(sessionToSave));
            setUserSession(newSessionData);

            setIsReAuthVisible(false);
            
            if (requestToRetry) {
                const retry = requestToRetry;
                setRequestToRetry(null);
                await retry();
            }
            return true;
        } catch (error) {
            setApiError(error.message || 'Senha incorreta ou falha no login.');
            return false;
        }
    };

    // NOVO: Função para cancelar a re-autenticação e fazer logout
    const cancelReAuth = () => {
        setIsReAuthVisible(false);
        setRequestToRetry(null);
        logout();
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
        // NOVO: Exporta os novos estados e funções
        isReAuthVisible,
        handleReAuth,
        cancelReAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);