// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as crypto from 'expo-crypto';

const API_URL_KEY = 'zenith_api_base_url';
const DEFAULT_API_URL = 'https://zenith.nicocereais.com.br:3080';

const SESSION_TOKEN_KEY = 'sessionToken';
const SNK_SESSION_ID_KEY = 'snkjsessionid';

// Obtém versão do app.json
const APP_VERSION = Constants.expoConfig?.version || '0.0.0';

let API_BASE_URL = '';

export const initializeApiUrl = async () => {
    try {
        const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
        API_BASE_URL = savedUrl || DEFAULT_API_URL;
        console.log(`[API] URL definida: ${API_BASE_URL} (v${APP_VERSION})`);
    } catch (error) {
        console.error("Erro ao inicializar API URL:", error);
        API_BASE_URL = DEFAULT_API_URL;
    }
    return API_BASE_URL;
};

export const setApiUrl = async (url) => {
    try {
        await AsyncStorage.setItem(API_URL_KEY, url);
        API_BASE_URL = url;
    } catch (error) {
        console.error("Erro ao definir API URL:", error);
    }
};

async function authenticatedFetch(endpoint, body = {}) {
    const sessionToken = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
    if (!sessionToken) {
        const authError = new Error('Nenhum token de sessão encontrado.');
        authError.reauthRequired = true;
        throw authError;
    }

    const headers = { 
        'Content-Type': 'application/json',
        'X-App-Version': APP_VERSION 
    };

    const transactionType = body.type;
    const requiresSessionId = endpoint === '/execute-transaction' &&
                              ['baixa', 'transferencia', 'picking'].includes(transactionType);

    if (requiresSessionId) {
        const snkjsessionid = await AsyncStorage.getItem(SNK_SESSION_ID_KEY);
        if (!snkjsessionid) {
            const authError = new Error('Sessão Sankhya não encontrada. Faça login novamente.');
            authError.reauthRequired = true;
            throw authError;
        }
        // Envia tanto no Cookie quanto no Header para garantir compatibilidade
        headers['Cookie'] = `sessionToken=${sessionToken}; snkjsessionid=${snkjsessionid}`;
        headers['Snkjsessionid'] = snkjsessionid; 
    } else {
        headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    // Timeout de 15s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        // TODAS as rotas autenticadas usam /apiv1
        const response = await fetch(`${API_BASE_URL}/apiv1${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        const data = responseText ? JSON.parse(responseText) : null;

        if (!response.ok) {
            const message = data ? (data.message || data.error) : `Erro ${response.status}`;
            const error = new Error(message);
            if (data && data.reauthRequired) { error.reauthRequired = true; }
            error.statusCode = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
             throw new Error('O servidor demorou muito para responder. Tente novamente.');
        }
        throw error;
    }
}

export async function login(username, password) {
    if (!API_BASE_URL) await initializeApiUrl();

    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    let deviceToken = await AsyncStorage.getItem(userTokenKey);

    if (!deviceToken) {
         try {
           deviceToken = Constants.installationId;
         } catch (e) {
             console.warn("Constants.installationId falhou, gerando UUID.");
         }
         if (!deviceToken) {
            deviceToken = crypto.randomUUID();
         }
         await AsyncStorage.setItem(userTokenKey, deviceToken);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s para login

    try {
        const response = await fetch(`${API_BASE_URL}/apiv1/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-App-Version': APP_VERSION
            },
            body: JSON.stringify({ username, password, deviceToken }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error("Login não retornou JSON:", text);
            throw new Error(`Erro ${response.status}: Resposta inesperada.`);
        }

        if (!response.ok) {
            const message = data ? (data.message || data.error) : 'Erro no login.';
            const error = new Error(message);
            error.statusCode = response.status;
            throw error;
        }

        if (data.sessionToken) {
            await AsyncStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
        } else {
            throw new Error('Token de sessão não recebido.');
        }

        if (data.snkjsessionid) {
            await AsyncStorage.setItem(SNK_SESSION_ID_KEY, data.snkjsessionid);
        } else {
             console.warn('AVISO: snkjsessionid não recebido.'); 
        }

        return data;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
             throw new Error('Tempo limite de conexão excedido.');
        }
        throw error;
    }
}

export async function logout() {
    try {
        await AsyncStorage.multiRemove([SESSION_TOKEN_KEY, SNK_SESSION_ID_KEY, 'userSession']);
        console.log('Dados locais limpos.');

        try {
             const controller = new AbortController();
             setTimeout(() => controller.abort(), 3000); 

             await fetch(`${API_BASE_URL}/apiv1/logout`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'X-App-Version': APP_VERSION },
                 body: JSON.stringify({}),
                 signal: controller.signal
             });
        } catch (e) { /* Ignora erro de rede no logout */ }

    } catch (e) {
        console.error("Erro crítico no logout local:", e);
    }
}

// Rotas auxiliares
export const fetchPermissions = () => authenticatedFetch('/permissions');

// CORREÇÃO: Garante envio de INT para o backend Go
export const searchItems = (codArm, filtro) => {
    const codArmInt = parseInt(codArm, 10);
    const payload = { 
        codArm: isNaN(codArmInt) ? 0 : codArmInt, 
        filtro: filtro || "" 
    };
    return authenticatedFetch('/search-items', payload);
};

export const fetchItemDetails = (codArm, sequencia) => {
    const codArmInt = parseInt(codArm, 10);
    const payload = { 
        codArm: isNaN(codArmInt) ? 0 : codArmInt, 
        sequencia: String(sequencia) 
    };
    return authenticatedFetch('/get-item-details', payload);
}

export const fetchHistory = () => authenticatedFetch('/get-history');

export const fetchPickingLocations = (codarm, codprod, sequencia) => {
    const payload = {
        codarm: parseInt(codarm, 10),
        codprod: parseInt(codprod, 10),
        sequencia: parseInt(sequencia, 10)
    };
    return authenticatedFetch('/get-picking-locations', payload);
}

export const executeTransaction = (type, payload) => authenticatedFetch('/execute-transaction', { type, payload }); 