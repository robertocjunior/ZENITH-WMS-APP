// api/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL_KEY = 'zenith_api_base_url';
const DEFAULT_API_URL = 'https://zenith.nicocereais.com.br:3080';

const SESSION_TOKEN_KEY = 'sessionToken';
const SNK_SESSION_ID_KEY = 'snkjsessionid';

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
// ALTERADO: Verifica o 'type' para enviar o cookie correto
// =================================================================
async function authenticatedFetch(endpoint, body = {}) {
    const sessionToken = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
    if (!sessionToken) {
        const authError = new Error('Nenhum token de sessão encontrado.');
        authError.reauthRequired = true;
        throw authError;
    }

    const headers = { 'Content-Type': 'application/json' };

    // --- INÍCIO DA MODIFICAÇÃO: Verifica endpoint E tipo da transação ---
    const transactionType = body.type; // Pega o tipo da transação do corpo da requisição
    const requiresSpecialCookie = endpoint === '/execute-transaction' &&
                                  ['baixa', 'transferencia', 'picking'].includes(transactionType);

    if (requiresSpecialCookie) {
        const snkjsessionid = await AsyncStorage.getItem(SNK_SESSION_ID_KEY);
        if (!snkjsessionid) {
            const authError = new Error('ID de sessão Sankhya (snkjsessionid) não encontrado. Faça login novamente.');
            authError.reauthRequired = true;
            throw authError;
        }
        // Envia os dois tokens como um único header 'Cookie' APENAS para baixa, transferencia, picking
        headers['Cookie'] = `sessionToken=${sessionToken}; snkjsessionid=${snkjsessionid}`;
        console.log(`Executando ${endpoint} (tipo ${transactionType}) com header Cookie: sessionToken=...; snkjsessionid=...`);
    } else {
        // Para todas as outras requisições (incluindo /execute-transaction do tipo 'correcao'), usa o Bearer token
        headers['Authorization'] = `Bearer ${sessionToken}`;
        if (endpoint === '/execute-transaction') {
             console.log(`Executando ${endpoint} (tipo ${transactionType}) com header Authorization: Bearer ...`);
        }
    }
    // --- FIM DA MODIFICAÇÃO ---

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    const responseText = await response.text();
    // Adiciona verificação para evitar erro de parse em respostas vazias (ex: logout 200 OK sem corpo)
    const data = responseText ? JSON.parse(responseText) : null; 

    if (!response.ok) {
        const message = data ? data.message : `Erro ${response.status}`;
        const error = new Error(message);
        if (data && data.reauthRequired) {
            error.reauthRequired = true;
        }
         // Adiciona status code ao erro para possível tratamento diferenciado
         error.statusCode = response.status;
        throw error;
    }

    return data;
}

export async function login(username, password) {
    if (!API_BASE_URL) await initializeApiUrl();

    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    let deviceToken = await AsyncStorage.getItem(userTokenKey);

    // Usa installationId como fallback se não houver token salvo específico do usuário
    if (!deviceToken) {
         deviceToken = Constants.installationId || crypto.randomUUID(); // Usa installationId ou gera um UUID
         console.log('Gerando/Usando novo deviceToken:', deviceToken);
         await AsyncStorage.setItem(userTokenKey, deviceToken); // Salva para uso futuro
    } else {
         console.log('Usando deviceToken existente:', deviceToken);
    }


    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, deviceToken })
    });

    // Verifica se a resposta não é JSON antes de tentar parsear
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        const textResponse = await response.text();
        console.error("Resposta não JSON do login:", response.status, textResponse);
        throw new Error(`Erro ${response.status}: Resposta inesperada do servidor.`);
    }


    if (!response.ok) {
        // Se a resposta contiver um novo token (após o registro do dispositivo)...
        if (data && data.deviceToken) {
             // Atualiza o token do dispositivo se o backend solicitar
             await AsyncStorage.setItem(userTokenKey, data.deviceToken);
        }
        throw new Error(data.message || 'Erro desconhecido no login.');
    }

    // Se o login for bem-sucedido e a resposta contiver um token...
    if (data && data.deviceToken) {
        // Salva (ou atualiza) o token na chave específica do usuário.
         await AsyncStorage.setItem(userTokenKey, data.deviceToken);
    }


    if (data && data.sessionToken) {
        await AsyncStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
    } else {
        console.warn('AVISO: O sessionToken não foi recebido do servidor após o login.');
        // Considerar lançar um erro aqui se o sessionToken for crucial
        // throw new Error('Falha no login: sessionToken não recebido.');
    }

    if (data && data.snkjsessionid) {
        await AsyncStorage.setItem(SNK_SESSION_ID_KEY, data.snkjsessionid);
    } else {
         console.warn('AVISO: O snkjsessionid não foi recebido do servidor após o login.');
         // Considerar lançar um erro aqui se o snkjsessionid for crucial
         // throw new Error('Falha no login: snkjsessionid não recebido.');
    }

    // A sessão completa (com permissões, etc) é salva no AuthContext após o login
    return data;
}

export async function logout() {
    try {
      // Tenta fazer o logout no backend, mas não bloqueia se falhar
      await authenticatedFetch('/logout');
    } catch (error) {
       // Apenas loga o erro, pois o principal é limpar localmente
      console.error("Erro ao tentar fazer logout no servidor (ignorado):", error.message);
       // Não relança o erro aqui para garantir que a limpeza local sempre ocorra
    } finally {
        // Garante a limpeza local mesmo se o fetch falhar
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
        await AsyncStorage.removeItem(SNK_SESSION_ID_KEY);
        await AsyncStorage.removeItem('userSession'); // Limpa a sessão do usuário também
        console.log('Tokens e sessão local limpos após logout.');
    }
}


export const fetchWarehouses = () => authenticatedFetch('/get-warehouses');
export const fetchPermissions = () => authenticatedFetch('/get-permissions');
export const searchItems = (codArm, filtro) => authenticatedFetch('/search-items', { codArm, filtro });
export const fetchItemDetails = (codArm, sequencia) => authenticatedFetch('/get-item-details', { codArm: String(codArm), sequencia: String(sequencia) });
export const fetchHistory = () => authenticatedFetch('/get-history');
export const fetchPickingLocations = (codarm, codprod, sequencia) => authenticatedFetch('/get-picking-locations', { codarm, codprod, sequencia });
export const executeTransaction = (type, payload) => authenticatedFetch('/execute-transaction', { type, payload }); // A lógica de header está em authenticatedFetch