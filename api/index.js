// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = 'http://192.168.2.57:3030/api'; // IP do seu log de erro

// Função genérica para chamadas autenticadas
async function authenticatedFetch(endpoint, body = {}) {
    // 1. Pega o token de sessão salvo no login
    const token = await AsyncStorage.getItem('sessionToken');
    if (!token) {
        // Se não houver token, força o logout no app
        throw new Error('401'); 
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 2. Envia o token no cabeçalho para o backend
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body),
    });

    if (response.status === 401) {
        throw new Error('401'); // Sessão expirou no backend
    }
    
    // O await response.json() pode falhar se o corpo for vazio
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
        throw new Error(data ? data.message : 'Erro na comunicação com o servidor.');
    }
    
    return data;
}

export async function login(username, password) {
    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    let deviceToken = await AsyncStorage.getItem(userTokenKey);

    if (!deviceToken) {
        deviceToken = Constants.installationId;
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
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

    // 3. Salva o sessionToken que o backend DEVE retornar
    if (data && data.sessionToken) {
        await AsyncStorage.setItem('sessionToken', data.sessionToken);
    } else {
        // Se o backend não enviar o token, o app não poderá fazer chamadas autenticadas
        console.warn('AVISO: O sessionToken não foi recebido do servidor após o login.');
    }

    await AsyncStorage.setItem('userSession', JSON.stringify(data));
    return data;
}

// --- Funções da API Reativadas ---

export async function logout() {
    // O corpo pode ser vazio, então tratamos a resposta de forma diferente
    await authenticatedFetch('/logout');
    // Limpa o armazenamento local após o logout
    await AsyncStorage.removeItem('sessionToken');
    await AsyncStorage.removeItem('userSession');
}

export function fetchWarehouses() {
    return authenticatedFetch('/get-warehouses');
}

export function fetchPermissions() {
    return authenticatedFetch('/get-permissions');
}

export function searchItems(codArm, filtro) {
    return authenticatedFetch('/search-items', { codArm, filtro });
}

export function fetchItemDetails(codArm, sequencia) {
    return authenticatedFetch('/get-item-details', { codArm: String(codArm), sequencia: String(sequencia) });
}

export function fetchHistory() {
    return authenticatedFetch('/get-history');
}

export function fetchPickingLocations(codarm, codprod, sequencia) {
    return authenticatedFetch('/get-picking-locations', { codarm, codprod, sequencia });
}

export function executeTransaction(type, payload) {
    return authenticatedFetch('/execute-transaction', { type, payload });
}