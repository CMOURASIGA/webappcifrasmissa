
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
  return (process.env.google_api || '').trim();
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
    throw new Error('A URL da API (google_api) não está configurada no ambiente.');
  }

  const TIMEOUT_MS = 300000; // 5 minutos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const isSaveMethod = methodName.startsWith('save') || methodName.startsWith('set');
    
    let response;
    
    if (isSaveMethod) {
      // Usar POST para salvar dados evita o erro de URL muito longa (que causava o erro de mimeType nulo)
      response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        signal: controller.signal,
        body: JSON.stringify({
          method: methodName,
          args: args
        })
      });
    } else {
      // Usar GET para leitura simples
      const urlWithParams = new URL(apiUrl);
      urlWithParams.searchParams.append('method', methodName);
      urlWithParams.searchParams.append('args', JSON.stringify(args));
      
      response = await fetch(urlWithParams.toString(), {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
        cache: 'no-store'
      });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro do Google (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (data && data.ok === false) {
      throw new Error(data.error || 'O Google retornou um erro interno.');
    }

    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('O tempo limite foi atingido. O Google Script pode estar demorando para processar muitos arquivos.');
    }
    throw e;
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
