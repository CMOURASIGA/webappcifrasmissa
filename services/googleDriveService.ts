
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
    throw new Error('URL da API não configurada. Configure e salve nos Ajustes.');
  }

  try {
    const isSaveMethod = methodName.startsWith('save') || methodName.startsWith('set');
    
    let response;
    
    if (isSaveMethod) {
      // POST "Simple Request": Sem cabeçalhos para evitar o preflight OPTIONS
      response = await fetch(currentRuntimeApiUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({
          method: methodName,
          args: args
        })
      });
    } else {
      // GET "Simple Request"
      const urlWithParams = new URL(currentRuntimeApiUrl);
      urlWithParams.searchParams.append('method', methodName);
      urlWithParams.searchParams.append('args', JSON.stringify(args));
      
      response = await fetch(urlWithParams.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });
    }

    if (!response.ok) {
      if (response.status === 404) throw new Error('API não encontrada (404). Verifique se a URL está correta.');
      throw new Error(`Erro na conexão com o Google (${response.status}). Verifique se o Script está publicado para "Qualquer pessoa".`);
    }

    const data = await response.json();
    if (data && data.ok === false) throw new Error(data.error || 'O Google Script retornou um erro interno.');
    return data;

  } catch (e: any) {
    console.error('Fetch error:', e);
    if (e.name === 'TypeError' || e.message.includes('fetch') || e.message.includes('NetworkError')) {
      throw new Error('Falha de Segurança (CORS). Certifique-se de que o Script está publicado como "App da Web" para "Qualquer Pessoa" (Anyone).');
    }
    throw e;
  }
};

export const googleDriveService = {
  setApiUrl: (url: string) => {
    currentRuntimeApiUrl = url.trim();
  },
  isApiConfigured: () => {
    // Tenta detectar tanto a URL manual quanto a de ambiente
    const envApi = (process.env as any).GOOGLE_API || '';
    return !!(currentRuntimeApiUrl || envApi);
  },
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', extractFolderId(id)),
  testFolderAccess: (id: string) => run('testFolderAccess', extractFolderId(id)),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
