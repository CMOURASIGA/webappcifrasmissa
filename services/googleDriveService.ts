
/**
 * Este serviço detecta se está rodando dentro do Google ou no Vercel.
 * Se estiver no Vercel, utiliza fetch() para o Web App do Google.
 */

declare const google: any;

// Função auxiliar para obter o URL da API salvo no localStorage
const getApiUrl = () => {
  try {
    const configRaw = localStorage.getItem('cifras_missa_config');
    if (!configRaw) return '';
    const config = JSON.parse(configRaw);
    return config.gasApiUrl || '';
  } catch (e) {
    console.error("Erro ao ler URL da API do localStorage:", e);
    return '';
  }
};

const run = async (methodName: string, ...args: any[]): Promise<any> => {
  // 1. Verificar se estamos dentro do ambiente Google Apps Script (iframe do GAS)
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[methodName](...args);
    });
  }

  // 2. Se estivermos no Vercel (ou local), usamos fetch para o Web App publicado
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    console.warn(`API URL não configurada. Tentando chamar método: ${methodName}`);
    // Retornamos um objeto de erro amigável em vez de lançar exceção fatal
    return { ok: false, error: 'Acesse Ajustes e configure a URL do seu Web App do Google Script.' };
  }

  try {
    // Tentativa principal usando GET com parâmetros (mais estável para GAS Web Apps externos)
    const urlWithParams = new URL(apiUrl);
    urlWithParams.searchParams.append('method', methodName);
    urlWithParams.searchParams.append('args', JSON.stringify(args));

    const response = await fetch(urlWithParams.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta da API: ${response.statusText}`);
    }

    return await response.json();
  } catch (e) {
    console.error(`Falha ao comunicar com Google Script (${methodName}):`, e);
    // Fallback: Tentativa via POST se o GET falhar (alguns scripts podem exigir POST)
    try {
       const postResponse = await fetch(apiUrl, {
         method: 'POST',
         body: JSON.stringify({ method: methodName, args: args }),
         // no-cors é um último recurso, mas impede a leitura da resposta JSON
         // O ideal é que o Web App do GAS tenha CORS habilitado.
       });
       if (postResponse.type === 'opaque') {
         return { ok: true, msg: 'Comando enviado (resposta opaca)' };
       }
       return await postResponse.json();
    } catch (postError) {
       throw new Error(`Erro de conexão com o backend do Google. Verifique se o Web App está publicado corretamente.`);
    }
  }
};

export const googleDriveService = {
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', id),
  testFolderAccess: (id: string) => run('testFolderAccess', id),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
