// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// -------------------------------------------------------------------------
// ATENÇÃO: SUBSTITUA 'SEU_IP_LOCAL' PELO IP DA MÁQUINA ONDE O BACKEND RODA.
// Exemplo: 'http://192.168.1.10:3030/api'
// -------------------------------------------------------------------------
const API_BASE_URL = 'http://192.168.2.57:3030/api';

async function authenticatedFetch(endpoint, body = {}) {
    const token = await AsyncStorage.getItem('sessionToken');
    if (!token) {
        throw new Error('401'); // Sinaliza sessão expirada/não autenticada
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Envia o token no cabeçalho
        },
        body: JSON.stringify(body),
    });

    if (response.status === 401) {
        throw new Error('401'); // Sessão expirou no backend
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro na comunicação com o servidor.');
    }
    
    if (response.status === 204 || !data) {
        return null;
    }

    return data;
}

export async function login(username, password) {
    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    let deviceToken = await AsyncStorage.getItem(userTokenKey);
    
    if (!deviceToken) {
        // Usa um ID único da instalação do app como token do dispositivo
        deviceToken = Constants.installationId;
        await AsyncStorage.setItem(userTokenKey, deviceToken);
    }
    
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceToken })
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erro desconhecido no login.');
    }
    
    // Supondo que o backend agora retorna o token JWT no corpo
    if (data.sessionToken) {
        await AsyncStorage.setItem('sessionToken', data.sessionToken);
    } else {
        throw new Error('Token de sessão não recebido do servidor.');
    }

    return data;
}

export async function logout() {
    await authenticatedFetch('/logout');
}

export const fetchWarehouses = () => authenticatedFetch('/get-warehouses');
export const fetchPermissions = () => authenticatedFetch('/get-permissions');
export const searchItems = (codArm, filtro) => authenticatedFetch('/search-items', { codArm, filtro });
export const fetchItemDetails = (codArm, sequencia) => authenticatedFetch('/get-item-details', { codArm, sequencia: String(sequencia) });
export const fetchHistory = () => authenticatedFetch('/get-history');
export const fetchPickingLocations = (codarm, codprod, sequencia) => authenticatedFetch('/get-picking-locations', { codarm, codprod, sequencia });
export const executeTransaction = (type, payload) => authenticatedFetch('/execute-transaction', { type, payload });