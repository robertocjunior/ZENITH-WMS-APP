// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL_KEY = 'zenith_api_base_url';
const DEFAULT_API_URL = 'https://zenith.nicocereais.com.br:3080';

let API_BASE_URL = '';

export const initializeApiUrl = async () => {
    const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
    API_BASE_URL = savedUrl || DEFAULT_API_URL;
    console.log(`API URL definida como: ${API_BASE_URL}`);
    return API_BASE_URL;
};

export const setApiUrl = async (url) => {
    await AsyncStorage.setItem(API_URL_KEY, url);
    API_BASE_URL = url;
    console.log(`API URL atualizada para: ${API_BASE_URL}`);
};

// =================================================================
// ALTERADO: A função foi reestruturada para tratar o erro 401 corretamente
// =================================================================
async function authenticatedFetch(endpoint, body = {}) {
    const token = await AsyncStorage.getItem('sessionToken');
    if (!token) {
        // Se não há token, é um erro de autorização que força o logout
        const authError = new Error('Nenhum token de sessão encontrado.');
        authError.reauthRequired = true; // Força o logout no AuthContext
        throw authError;
    }

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
        // Centraliza o tratamento de todos os erros aqui
        const message = data ? data.message : `Erro ${response.status}`;
        const error = new Error(message);
        
        // Se o backend enviar a flag, anexa ao erro para o AuthContext detectar
        if (data && data.reauthRequired) {
            error.reauthRequired = true;
        }
        throw error;
    }
    
    return data;
}

export async function login(username, password) {
    if (!API_BASE_URL) await initializeApiUrl();

    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    let deviceToken = await AsyncStorage.getItem(userTokenKey);

    if (!deviceToken) {
        deviceToken = Constants.installationId;
    }

    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceToken })
    });
    
    const data = await response.json();

    if (!response.ok) {
        if (data && data.deviceToken) {
            await AsyncStorage.setItem(userTokenKey, data.deviceToken);
        }
        throw new Error(data.message || 'Erro desconhecido no login.');
    }
    
    if (data && data.deviceToken) {
        await AsyncStorage.setItem(userTokenKey, data.deviceToken);
    }

    if (data && data.sessionToken) {
        await AsyncStorage.setItem('sessionToken', data.sessionToken);
    } else {
        console.warn('AVISO: O sessionToken não foi recebido do servidor após o login.');
    }

    // A sessão completa (com permissões, etc) é salva no AuthContext após o login
    return data;
}

export async function logout() {
    await authenticatedFetch('/logout').catch(() => {}); // Ignora erros no logout
    await AsyncStorage.removeItem('sessionToken');
    await AsyncStorage.removeItem('userSession');
}

export const fetchWarehouses = () => authenticatedFetch('/get-warehouses');
export const fetchPermissions = () => authenticatedFetch('/get-permissions');
export const searchItems = (codArm, filtro) => authenticatedFetch('/search-items', { codArm, filtro });
export const fetchItemDetails = (codArm, sequencia) => authenticatedFetch('/get-item-details', { codArm: String(codArm), sequencia: String(sequencia) });
export const fetchHistory = () => authenticatedFetch('/get-history');
export const fetchPickingLocations = (codarm, codprod, sequencia) => authenticatedFetch('/get-picking-locations', { codarm, codprod, sequencia });
export const executeTransaction = (type, payload) => authenticatedFetch('/execute-transaction', { type, payload });