// contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api'; // Importa a api para usar o logout centralizado

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [userSession, setUserSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Tempo limite (50 min) para validação no boot do app
    const SESSION_TIMEOUT_MS = 50 * 60 * 1000;

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            // As chaves devem corresponder às usadas no api/index.js
            const storedUser = await AsyncStorage.getItem('userSession');
            const storedToken = await AsyncStorage.getItem('sessionToken');
            const lastActivity = await AsyncStorage.getItem('last_activity_timestamp');

            if (storedUser && storedToken) {
                // VERIFICAÇÃO DE INATIVIDADE AO ABRIR O APP
                if (lastActivity) {
                    const now = Date.now();
                    const lastTime = parseInt(lastActivity, 10);

                    // Se passou 50 minutos desde a última atividade
                    if (now - lastTime > SESSION_TIMEOUT_MS) {
                        console.log("Sessão expirada em background. Realizando logout silencioso.");
                        await signOut(); 
                        return;
                    }
                }

                setUserSession(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Falha ao carregar dados do storage", error);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (userData, token) => {
        try {
            // Salva dados da sessão
            await AsyncStorage.setItem('userSession', JSON.stringify(userData));
            
            // O token já é salvo pelo api.login, mas garantimos o timestamp inicial aqui
            await AsyncStorage.setItem('last_activity_timestamp', Date.now().toString());

            setUserSession(userData);
        } catch (error) {
            console.error("Erro ao salvar login", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            // Chama o logout da API para limpar todas as chaves (token, timestamp, etc)
            await api.logout();
            setUserSession(null); // Isso disparará a navegação para a tela de Login
        } catch (error) {
            console.error("Erro ao fazer logout", error);
            setUserSession(null);
        }
    };

    // Função centralizada de erro para usar nas telas
    const handleApiError = (error) => {
        console.error("API Error Handler:", error);

        // 1. LÓGICA DE SESSÃO EXPIRADA (SEM POPUP)
        // Verifica se é timeout local, flag de reauthRequired ou erro 401 do servidor
        if (
            error.code === 'SESSION_EXPIRED_LOCAL' || 
            error.isLocalTimeout || 
            error.reauthRequired ||
            (error.response && error.response.status === 401)
        ) {
            // AÇÃO: Logout direto sem perguntar ou avisar
            signOut();
            return;
        }

        // 2. Outros erros (mantém o alerta para erros de negócio ou conexão)
        const msg = error.response?.data?.message || error.message || "Ocorreu um erro na comunicação.";
        Alert.alert("Erro", msg);
    };

    return (
        <AuthContext.Provider value={{
            userSession,
            loading,
            signIn,
            signOut,
            handleApiError, 
            isAuthenticated: !!userSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);