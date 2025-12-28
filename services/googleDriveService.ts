
/**
 * Este serviço gerencia a comunicação com o Google Apps Script.
 */

declare const google: any;

const extractFolderId = (input: string): string => {
  if (!input) return '';
  if (input.includes('folders/')) {
    return input.split('folders/')[1].split('?')[0].split('/')[0];
  }
  return input.trim();
};

let currentRuntimeApiUrl = '';

const run = async (methodName: string, ...args: any[]): Promise<any> => {
  // 1. Ambiente Google Apps Script (se embutido)
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[methodName](...args);
    });
  }

  // 2. Ambiente Externo
  if (!currentRuntimeApiUrl) {
    throw new Error('URL da API não configurada. Vá em Ajustes.');
  }

  try {
    const isSaveMethod = methodName.startsWith('save') || methodName.startsWith('set');
    
    let response;
    
    // Para Google Apps Script, o POST deve ser o mais simples possível
    if (isSaveMethod) {
      response = await fetch(currentRuntimeApiUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        // Não definimos Content-Type para evitar Preflight OPTIONS (causa de erro de CORS)
        body: JSON.stringify({
          method: methodName,
          args: args
        })
      });
    } else {
      const urlWithParams = new URL(currentRuntimeApiUrl);
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
      throw new Error(`Erro HTTP ${response.status}. Verifique a publicação do script.`);
    }

    const data = await response.json();
    if (data && data.ok === false) throw new Error(data.error || 'Erro interno no Script.');
    return data;

  } catch (e: any) {
    console.error('Fetch error:', e);
    if (e.name === 'TypeError' || e.message.includes('fetch')) {
      throw new Error('Falha de Conexão/CORS. Verifique se o Script está publicado como "Qualquer Pessoa" (Anyone).');
    }
    throw e;
  }
};

export const googleDriveService = {
  setApiUrl: (url: string) => {
    currentRuntimeApiUrl = url.trim();
  },
  // Fix: Property 'isApiConfigured' does not exist on type
  isApiConfigured: () => !!currentRuntimeApiUrl,
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', extractFolderId(id)),
  testFolderAccess: (id: string) => run('testFolderAccess', extractFolderId(id)),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
