
/**
 * Este serviço gerencia a comunicação com o Google Apps Script.
 * Otimizado para evitar erros de CORS 'Failed to fetch' e problemas de redirecionamento.
 */

declare const google: any;

const extractFolderId = (input: string): string => {
  if (!input) return '';
  if (input.includes('folders/')) {
    const parts = input.split('folders/')[1].split('?')[0].split('/');
    return parts[0].trim();
  }
  return input.trim();
};

let currentRuntimeApiUrl = '';

const run = async (methodName: string, ...args: any[]): Promise<any> => {
  // 1. Ambiente Google Apps Script (se embutido no editor de script)
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[methodName](...args);
    });
  }

  // 2. Ambiente Externo (Vercel/Web)
  if (!currentRuntimeApiUrl) {
    throw new Error('URL da API não configurada. Vá em Ajustes.');
  }

  try {
    const isSaveMethod = methodName.startsWith('save') || methodName.startsWith('set');
    let response;

    /**
     * SOLUÇÃO PARA 'Failed to fetch':
     * Enviamos como POST mesmo para leituras se necessário, ou usamos GET limpo.
     * O segredo é NÃO enviar cabeçalhos customizados para evitar o preflight OPTIONS.
     */
    if (isSaveMethod) {
      // POST "Simple Request"
      // Nota: Não definimos Content-Type para ser tratado como text/plain pelo navegador
      // mas o corpo é um JSON que o GAS entende via e.postData.contents
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
      throw new Error(`Servidor respondeu com erro ${response.status}`);
    }

    const data = await response.json();
    if (data && data.ok === false) throw new Error(data.error || 'Erro interno no script do Google.');
    return data;

  } catch (e: any) {
    console.error('Fetch error:', e);
    
    // Tratamento específico para o erro que o usuário relatou
    if (e.message.includes('fetch') || e.name === 'TypeError') {
      throw new Error(
        'Falha na Conexão (Failed to fetch). Dicas:\n' +
        '1. Verifique se o Script está publicado para "Qualquer Pessoa" (Anyone).\n' +
        '2. Tente usar uma Aba Anônima (se você tiver várias contas Google logadas, o redirecionamento do Script falha).\n' +
        '3. Certifique-se que a URL termina em /exec'
      );
    }
    throw e;
  }
};

export const googleDriveService = {
  setApiUrl: (url: string) => {
    if (url) currentRuntimeApiUrl = url.trim();
  },
  isApiConfigured: () => {
    const envApi = (process.env.GOOGLE_API as string) || '';
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
