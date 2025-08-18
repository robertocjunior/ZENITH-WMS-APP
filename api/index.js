// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// -------------------------------------------------------------------------
// ATENÇÃO: Verifique se este IP ainda é o correto para sua máquina.
// -------------------------------------------------------------------------
const API_BASE_URL = 'http://192.168.2.57:3030/api'; // Usei o IP do seu log de erro

// Função genérica para futuras chamadas autenticadas (ainda não usada no login)
async function authenticatedFetch(endpoint, body = {}) {
    // A lógica de autenticação (com sessionToken ou outro método) viria aqui
    // Por enquanto, vamos focar no login
}

export async function login(username, password) {
    // 1. Constrói a chave de armazenamento específica para o usuário
    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    
    // 2. Procura por um token que já pertença a este usuário neste dispositivo
    let deviceToken = await AsyncStorage.getItem(userTokenKey);

    // 3. Se não encontrar, gera um novo a partir do ID de instalação do app
    if (!deviceToken) {
        deviceToken = Constants.installationId;
    }

    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceToken })
    });
    
    const data = await response.json();

    // 4. Lógica CORRIGIDA: Trata a resposta do servidor
    if (!response.ok) {
        // Se a resposta de erro contiver um novo deviceToken (caso "Dispositivo novo")...
        if (data && data.deviceToken) {
            // ...salva o novo token para ser usado na próxima tentativa.
            await AsyncStorage.setItem(userTokenKey, data.deviceToken);
        }
        // Lança o erro para ser exibido na tela
        throw new Error(data.message || 'Erro desconhecido no login.');
    }
    
    // 5. Se o login for bem-sucedido (200 OK)...
    if (data && data.deviceToken) {
        // ...salva ou atualiza o token no armazenamento.
        await AsyncStorage.setItem(userTokenKey, data.deviceToken);
    }

    // ATENÇÃO: A API de login não parece retornar um "sessionToken" para autenticar
    // as próximas requisições. O código foi ajustado para não esperar por ele.
    // Salva a sessão do usuário para manter o estado de "logado" no app.
    await AsyncStorage.setItem('userSession', JSON.stringify(data));

    return data;
}

// Funções futuras...
// export async function logout() { ... }