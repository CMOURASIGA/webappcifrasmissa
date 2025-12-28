
/**
 * Este serviço gerencia a comunicação com o Google Apps Script.
 * Analisa variáveis de ambiente e configurações manuais.
 */

declare const google: any;

const extractFolderId = (input: string): string => {
  if (!input) return '';
  if (input.includes('folders/')) {
    return input.split('folders/')[1].split('?')[0].split('/')[0];
  }
  return input.trim();
};

const getApiUrl = () => {
  // Análise robusta: tenta buscar do process.env (Vercel) ou de uma variável global
  const api = (
    (process.env as any).GOOGLE_API || 
    (process.env as any).google_api || 
    ''
  ).trim();
  return api;
};

const run = async (methodName: string, ...args: any[]): Promise<any> => {
  // 1. Ambiente Google Apps Script (se embutido)
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[methodName](...args);
    });
  }

  // 2. Ambiente Externo (Vercel/Local)
  const apiUrl = getApiUrl();
  
  if (!apiUrl) {
    throw new Error('Configuração Ausente: A variável GOOGLE_API não foi definida no Vercel ou no ambiente.');
  }

  try {
    const isSaveMethod = methodName.startsWith('save') || methodName.startsWith('set');
    
    let response;
    
    if (isSaveMethod) {
      // POST para GAS: Enviamos como text/plain para evitar Preflight OPTIONS (erro comum de CORS)
      response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow', // Crucial para o Google Apps Script
        body: JSON.stringify({
          method: methodName,
          args: args
        })
      });
    } else {
      // GET para GAS
      const urlWithParams = new URL(apiUrl);
      urlWithParams.searchParams.append('method', methodName);
      urlWithParams.searchParams.append('args', JSON.stringify(args));
      
      response = await fetch(urlWithParams.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-store'
      });
    }

    if (!response.ok) {
      if (response.status === 404) throw new Error('Script não encontrado (404). Verifique a URL da API.');
      throw new Error(`Erro HTTP ${response.status}. Verifique se o script está publicado como "Anyone".`);
    }

    const data = await response.json();
    if (data && data.ok === false) throw new Error(data.error || 'Erro no Google Script.');
    return data;

  } catch (e: any) {
    if (e.name === 'TypeError' && e.message.includes('fetch')) {
      throw new Error('Bloqueio de CORS: O Google Script não permitiu o acesso. Verifique se ele foi publicado como "Qualquer Pessoa" (Anyone).');
    }
    throw e;
  }
};

export const googleDriveService = {
  isApiConfigured: () => !!getApiUrl(),
  getApiUrl: () => getApiUrl(),
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', extractFolderId(id)),
  testFolderAccess: (id: string) => run('testFolderAccess', extractFolderId(id)),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
