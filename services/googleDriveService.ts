
/**
 * Este serviço gerencia a comunicação com o Google Apps Script.
 * Ajustado para evitar erros de CORS (Preflight OPTIONS).
 */

declare const google: any;

const extractFolderId = (input: string): string => {
  if (input.includes('folders/')) {
    return input.split('folders/')[1].split('?')[0].split('/')[0];
  }
  return input.trim();
};

const getApiUrl = () => {
  return (process.env.google_api || '').trim();
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
  if (!apiUrl) throw new Error('Variável google_api não configurada.');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const isSaveMethod = methodName.startsWith('save') || methodName.startsWith('set');
    console.debug(`[AppDrive] Chamando: ${methodName}`);

    let response;
    
    if (isSaveMethod) {
      // IMPORTANTE: Enviamos como text/plain para evitar o Preflight OPTIONS do CORS
      // O Google Script receberá o JSON no corpo da requisição (e.postData.contents)
      response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow', // Obrigatório para o redirecionamento do Google
        body: JSON.stringify({
          method: methodName,
          args: args
        })
      });
    } else {
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

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}. Verifique se o script está publicado como "Anyone".`);
    }

    const data = await response.json();
    if (data && data.ok === false) throw new Error(data.error || 'Erro no Google Script.');
    return data;

  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'TypeError' && e.message.includes('fetch')) {
      throw new Error('Erro de CORS/Rede. O Google Script não retornou permissão ou não está publicado corretamente.');
    }
    throw e;
  }
};

export const googleDriveService = {
  isApiConfigured: () => !!getApiUrl(),
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', extractFolderId(id)),
  testFolderAccess: (id: string) => run('testFolderAccess', extractFolderId(id)),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
