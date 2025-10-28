// api/index.js (MODIFICADO)
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
// Importa crypto se ainda não estiver importado (necessário para o fallback do deviceToken)
import * as crypto from 'expo-crypto'; // Ou 'react-native-get-random-values' se não usar Expo

const API_URL_KEY = 'zenith_api_base_url';
const DEFAULT_API_URL = 'https://zenith.nicocereais.com.br:3080';

const SESSION_TOKEN_KEY = 'sessionToken';
const SNK_SESSION_ID_KEY = 'snkjsessionid';

// **** ADICIONADO: Pega a versão do app.json ****
// Use expoConfig.version (do app.json) ou Application.nativeApplicationVersion (nativo)
const APP_VERSION = Constants.expoConfig?.version || '0.0.0';
console.log(`[App Version] ${APP_VERSION}`); // Log para depuração

let API_BASE_URL = '';

export const initializeApiUrl = async () => {
    try {
        const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
        API_BASE_URL = savedUrl || DEFAULT_API_URL;
        console.log(`API URL definida como: ${API_BASE_URL}`);
    } catch (error) {
        console.error("Erro ao inicializar API URL:", error);
        API_BASE_URL = DEFAULT_API_URL; // Fallback seguro
    }
    return API_BASE_URL;
};

export const setApiUrl = async (url) => {
    try {
        await AsyncStorage.setItem(API_URL_KEY, url);
        API_BASE_URL = url;
        console.log(`API URL atualizada para: ${API_BASE_URL}`);
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

    // **** MODIFICADO: Adicionado X-App-Version ****
    const headers = { 
        'Content-Type': 'application/json',
        'X-App-Version': APP_VERSION 
    };

    const transactionType = body.type;
    const requiresSpecialCookie = endpoint === '/execute-transaction' &&
                                  ['baixa', 'transferencia', 'picking'].includes(transactionType);

    if (requiresSpecialCookie) {
        const snkjsessionid = await AsyncStorage.getItem(SNK_SESSION_ID_KEY);
        if (!snkjsessionid) {
            const authError = new Error('ID de sessão Sankhya (snkjsessionid) não encontrado. Faça login novamente.');
            authError.reauthRequired = true;
            throw authError;
        }
        headers['Cookie'] = `sessionToken=${sessionToken}; snkjsessionid=${snkjsessionid}`;
        console.log(`Executando ${endpoint} (tipo ${transactionType}) com header Cookie: sessionToken=...; snkjsessionid=...`);
    } else {
        headers['Authorization'] = `Bearer ${sessionToken}`;
        if (endpoint === '/execute-transaction') {
             console.log(`Executando ${endpoint} (tipo ${transactionType}) com header Authorization: Bearer ...`);
        }
    }

    // Adiciona timeout à requisição fetch (ex: 15 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

    try {
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal: controller.signal // Adiciona o signal para o timeout
        });

        clearTimeout(timeoutId); // Limpa o timeout se a resposta chegar a tempo

        const responseText = await response.text();
        const data = responseText ? JSON.parse(responseText) : null;

        if (!response.ok) {
            const message = data ? data.message : `Erro ${response.status}`;
            const error = new Error(message);
            if (data && data.reauthRequired) {
                error.reauthRequired = true;
            }
            error.statusCode = response.status; // Passa o status code no erro
            throw error;
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId); // Limpa o timeout em caso de erro também
         if (error.name === 'AbortError') {
             console.error(`Timeout da requisição para ${endpoint}`);
             throw new Error('O servidor demorou muito para responder. Tente novamente.');
         }
        // Re-lança outros erros (incluindo os já tratados como reauthRequired)
        throw error;
    }
}

export async function login(username, password) {
    if (!API_BASE_URL) await initializeApiUrl();

    const userTokenKey = `deviceToken_${username.toUpperCase()}`;
    let deviceToken = await AsyncStorage.getItem(userTokenKey);

    if (!deviceToken) {
         // Tenta usar expo-constants, se falhar, gera UUID
         try {
           deviceToken = Constants.installationId;
         } catch (e) {
             console.warn("Não foi possível obter Constants.installationId, gerando UUID.");
         }
         if (!deviceToken) {
            deviceToken = crypto.randomUUID();
         }
         console.log('Gerando/Usando novo deviceToken:', deviceToken);
         await AsyncStorage.setItem(userTokenKey, deviceToken);
    } else {
         console.log('Usando deviceToken existente:', deviceToken);
    }

    // Adiciona timeout ao login também
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos para login

    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            // **** MODIFICADO: Adicionado X-App-Version ****
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
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            const textResponse = await response.text();
            console.error("Resposta não JSON do login:", response.status, textResponse);
            throw new Error(`Erro ${response.status}: Resposta inesperada do servidor.`);
        }

        if (!response.ok) {
            if (data && data.deviceToken) {
                 await AsyncStorage.setItem(userTokenKey, data.deviceToken);
            }
             // **** ADICIONADO: Tratamento do 426 no login ****
            const message = data ? data.message : 'Erro desconhecido no login.';
            const error = new Error(message);
            error.statusCode = response.status; // Passa o status code no erro
            throw error;
        }

        if (data && data.deviceToken) {
             await AsyncStorage.setItem(userTokenKey, data.deviceToken);
        }

        if (data && data.sessionToken) {
            await AsyncStorage.setItem(SESSION_TOKEN_KEY, data.sessionToken);
        } else {
            console.warn('AVISO: O sessionToken não foi recebido do servidor após o login.');
            throw new Error('Falha no login: sessionToken não recebido.'); // Falha crítica
        }

        if (data && data.snkjsessionid) {
            await AsyncStorage.setItem(SNK_SESSION_ID_KEY, data.snkjsessionid);
        } else {
             console.warn('AVISO: O snkjsessionid não foi recebido do servidor após o login.');
             throw new Error('Falha no login: snkjsessionid não recebido.'); // Falha crítica
        }

        return data;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
             console.error(`Timeout da requisição de login`);
             throw new Error('O servidor de login demorou muito para responder. Verifique a URL da API ou tente novamente.');
        }
        // Re-lança outros erros (incluindo o 426)
        throw error;
    }
}


// =================================================================
// ALTERADO: Limpa localmente PRIMEIRO, depois tenta chamar backend
// =================================================================
export async function logout() {
    console.log('Iniciando processo de logout...');
    try {
        // 1. Limpa os tokens e a sessão do usuário localmente PRIMEIRO.
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
        await AsyncStorage.removeItem(SNK_SESSION_ID_KEY);
        await AsyncStorage.removeItem('userSession'); // Limpa a sessão do usuário também
        console.log('Tokens e sessão local limpos.');

        // 2. Tenta notificar o backend sobre o logout.
        // Usa um try/catch separado para não impedir o logout local se o backend falhar.
        try {
            console.log('Tentando notificar o backend sobre o logout...');
            // Não precisamos mais do resultado, apenas tentamos chamar.
            // authenticatedFetch('/logout') pode falhar aqui se o token já foi limpo,
            // então fazemos uma chamada fetch simples sem esperar autenticação complexa.
            // Usamos um timeout curto para esta chamada opcional.
             const controller = new AbortController();
             const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

             const sessionTokenForLogout = await AsyncStorage.getItem(SESSION_TOKEN_KEY); // Lê de novo caso tenha sido limpo muito rápido? Não, já limpamos. Vamos fazer sem token.
             // O backend /logout idealmente invalidaria a sessão baseada no cookie que ele recebe,
             // mas como já limpamos, talvez ele não consiga. A limpeza local é o mais importante.
             // Tentaremos mesmo assim, pode ser útil para o backend limpar sessões ativas.

            await fetch(`${API_BASE_URL}/api/logout`, {
                 method: 'POST',
                 headers: {
                     // Não envia mais headers de autenticação complexos,
                     // pois podem já ter sido limpos ou podem falhar.
                     // O backend /logout deve ser capaz de lidar com isso
                     // (ex: invalidar o cookie se presente, ou apenas retornar sucesso).
                     'Content-Type': 'application/json',
                     'X-App-Version': APP_VERSION // **** ADICIONADO: Envia a versão também no logout (boa prática) ****
                 },
                 body: JSON.stringify({}), // Corpo vazio
                 signal: controller.signal
             });
             clearTimeout(timeoutId);
             console.log('Notificação de logout enviada ao backend (ou timeout/erro ignorado).');

        } catch (backendError) {
            // Ignora erros de comunicação com o backend durante o logout.
            console.warn("Não foi possível notificar o backend sobre o logout (servidor offline ou outro erro):", backendError.message);
        }

    } catch (storageError) {
        // Erro GRAVE se não conseguir limpar o AsyncStorage.
        console.error("Erro CRÍTICO ao limpar dados locais durante o logout:", storageError);
        // Informar o usuário pode ser uma boa ideia aqui, dependendo da UI.
        // Ex: Alert.alert("Erro", "Não foi possível limpar a sessão local.");
        // Mesmo com erro, tentamos garantir que o estado da aplicação seja resetado.
        // O AuthContext chamará esta função e forçará a ida para a tela de login.
    }
}


export const fetchWarehouses = () => authenticatedFetch('/get-warehouses');
export const fetchPermissions = () => authenticatedFetch('/get-permissions');
export const searchItems = (codArm, filtro) => authenticatedFetch('/search-items', { codArm, filtro });
export const fetchItemDetails = (codArm, sequencia) => authenticatedFetch('/get-item-details', { codArm: String(codArm), sequencia: String(sequencia) });
export const fetchHistory = () => authenticatedFetch('/get-history');
export const fetchPickingLocations = (codarm, codprod, sequencia) => authenticatedFetch('/get-picking-locations', { codarm, codprod, sequencia });
export const executeTransaction = (type, payload) => authenticatedFetch('/execute-transaction', { type, payload });