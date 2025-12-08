// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';

const AuthContext = createContext(null);

const MINIMUM_LOADING_TIME = 2000; // Reduzi levemente para agilizar
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

    const [isReAuthVisible, setIsReAuthVisible] = useState(false);
    const [requestToRetry, setRequestToRetry] = useState(null);

    const loadLastWarehouseForUser = async (codusu) => {
        try {
            const storedData = await AsyncStorage.getItem(LAST_WAREHOUSES_KEY);
            const warehousesMap = storedData ? JSON.parse(storedData) : {};
            setLastWarehouse(warehousesMap[codusu] || null);
        } catch (e) { console.error("Erro storage armazém:", e); }
    };
    
    const loadLastUsername = async () => {
        try {
            const username = await AsyncStorage.getItem(LAST_USERNAME_KEY);
            if (username) setLastUsername(username);
        } catch (e) { console.error("Erro storage user:", e); }
    };

    useEffect(() => {
        const checkLogin = async () => {
            try {
                await loadLastUsername();
                const sessionData = await AsyncStorage.getItem('userSession');
                
                if (sessionData) {
                    const parsedData = JSON.parse(sessionData);
                    setUserSession(parsedData.userSession);
                    setPermissions(parsedData.permissions);
                    setWarehouses(parsedData.warehouses);
                    if (parsedData.userSession?.codusu) {
                        await loadLastWarehouseForUser(parsedData.userSession.codusu);
                    }
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
            if (authStatus === 'authenticating' && userSession) {
                try {
                    const dataPromise = (async () => {
                        const [perms, whs] = await Promise.all([api.fetchPermissions(), api.fetchWarehouses()]);
                        const sessionToSave = { userSession, permissions: perms, warehouses: whs };
                        await AsyncStorage.setItem('userSession', JSON.stringify(sessionToSave));
                        return { perms, whs };
                    })();

                    const minTimePromise = new Promise(resolve => setTimeout(resolve, MINIMUM_LOADING_TIME));
                    const [data] = await Promise.all([dataPromise, minTimePromise]);
                    
                    setPermissions(data.perms);
                    setWarehouses(data.whs);
                    await loadLastWarehouseForUser(userSession.codusu);
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
            setAuthStatus('authenticating');
        } catch (error) {
            handleApiError(error);
            throw error;
        }
    };

    const logout = async () => {
        try { await api.logout(); } 
        catch (e) { console.error("Logout error:", e); } 
        finally {
            setUserSession(null);
            setPermissions(null);
            setWarehouses([]);
            setLastWarehouse(null);
            setAuthStatus('loggedOut');
        }
    };

    const saveLastWarehouse = async (codusu, warehouseCode) => {
        try {
            const storedData = await AsyncStorage.getItem(LAST_WAREHOUSES_KEY);
            const warehousesMap = storedData ? JSON.parse(storedData) : {};
            warehousesMap[codusu] = warehouseCode;
            await AsyncStorage.setItem(LAST_WAREHOUSES_KEY, JSON.stringify(warehousesMap));
        } catch (e) { console.error("Erro ao salvar armazém:", e); }
    };

    const handleApiError = (error, retryFunc = null) => {
        if (error.statusCode === 426) {
            setApiError(error.message || 'Aplicativo desatualizado. Atualize para continuar.');
            if (authStatus !== 'loggedOut') logout();
            return;
        }

        if (error.reauthRequired && retryFunc) {
            setRequestToRetry(() => () => retryFunc());
            setIsReAuthVisible(true);
        } else if (error.reauthRequired || error.statusCode === 401) {
             setApiError("Sessão expirada.");
             logout();
        } else {
            setApiError(error.message || 'Erro inesperado.');
        }
    };

    const handleReAuth = async (password) => {
        const currentUsername = userSession?.username || lastUsername;
        if (!currentUsername) return false;
        
        setApiError(null);

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
            handleApiError(error); 
            if(error.statusCode !== 426) {
                 setApiError('Senha incorreta.');
            }
            return false;
        }
    };

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
        isReAuthVisible,
        handleReAuth,
        cancelReAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);