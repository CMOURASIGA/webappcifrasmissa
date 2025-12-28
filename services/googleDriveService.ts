
/**
 * Este serviço detecta se está rodando dentro do Google ou no Vercel.
 * Se estiver no Vercel, utiliza fetch() para o Web App do Google.
 */

declare const google: any;

// Função auxiliar para extrair o ID da pasta caso o usuário cole o link completo
const extractFolderId = (input: string): string => {
  if (input.includes('folders/')) {
    return input.split('folders/')[1].split('?')[0].split('/')[0];
  }
  return input.trim();
};

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
  // 1. Verificar se estamos dentro do ambiente Google Apps Script
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[methodName](...args);
    });
  }

  // 2. Se estivermos no Vercel (ou local)
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    return { ok: false, error: 'URL da API não configurada.' };
  }

  try {
    // IMPORTANTE: Para evitar erro de CORS 'Failed to fetch' com GAS,
    // NÃO podemos enviar cabeçalhos personalizados (como Accept ou Content-Type).
    const urlWithParams = new URL(apiUrl);
    urlWithParams.searchParams.append('method', methodName);
    urlWithParams.searchParams.append('args', JSON.stringify(args));

    const response = await fetch(urlWithParams.toString(), {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error(`Falha ao comunicar com Google Script (${methodName}):`, e);
    throw new Error('Falha na conexão. Verifique o URL e a publicação do Script.');
  }
};

export const googleDriveService = {
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', extractFolderId(id)),
  testFolderAccess: (id: string) => run('testFolderAccess', extractFolderId(id)),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
