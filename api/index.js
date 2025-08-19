// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// --- 1. LÓGICA DE URL DINÂMICA ---
const API_URL_KEY = 'zenith_api_base_url';
const DEFAULT_API_URL = 'http://192.168.2.57:3030'; // Um valor padrão caso nenhum seja salvo

let API_BASE_URL = '';

// Função para carregar e definir a URL da API
export const initializeApiUrl = async () => {
    const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
    API_BASE_URL = savedUrl || DEFAULT_API_URL;
    console.log(`API URL definida como: ${API_BASE_URL}`);
    return API_BASE_URL;
};

// Função para atualizar e salvar a URL
export const setApiUrl = async (url) => {
    await AsyncStorage.setItem(API_URL_KEY, url);
    API_BASE_URL = url;
    console.log(`API URL atualizada para: ${API_BASE_URL}`);
};
// ---------------------------------

async function authenticatedFetch(endpoint, body = {}) {
    const token = await AsyncStorage.getItem('sessionToken');
    if (!token) {
        throw new Error('401'); 
    }

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, { // Adiciona o /api aqui
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
    });

    if (response.status === 401) throw new Error('401');
    
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
        throw new Error(data ? data.message : 'Erro na comunicação com o servidor.');
    }
    
    return data;
}

export async function login(username, password) {
    if (!API_BASE_URL) await initializeApiUrl(); // Garante que a URL esteja carregada

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

    await AsyncStorage.setItem('userSession', JSON.stringify(data));
    return data;
}

// ... (resto das funções da API permanecem as mesmas)
export async function logout() {
    await authenticatedFetch('/logout');
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