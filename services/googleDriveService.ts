
/**
 * Este serviço gerencia a comunicação com o Google Apps Script.
 * Focado em evitar o erro 'Failed to fetch' através de requisições GET e simplificação de POST.
 */

declare const google: any;

const cleanUrl = (url: string): string => {
  return url.trim().replace(/[\n\r\s]/g, '');
};

const extractFolderId = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.includes('folders/')) {
    const parts = trimmed.split('folders/')[1].split('?')[0].split('/');
    return parts[0].trim();
  }
  return trimmed;
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

  // 2. Ambiente Externo (Vercel/Web)
  if (!currentRuntimeApiUrl) {
    throw new Error('URL da API não configurada nos Ajustes.');
  }

  const targetUrl = cleanUrl(currentRuntimeApiUrl);

  // Validação básica de URL
  if (targetUrl.includes('/edit')) {
    throw new Error('Você colou a URL do Editor. Use a URL gerada em "Implantar > Nova Implantação" que termina em /exec');
  }

  try {
    // Para operações de leitura ou testes, usamos GET obrigatoriamente (mais seguro contra CORS)
    // Para operações de escrita volumosa (save), usamos POST.
    const isSaveOperation = methodName.startsWith('save') || (methodName === 'saveUserLists' && JSON.stringify(args).length > 1000);
    
    let response;
    
    if (isSaveOperation) {
      // POST "Simple Request" - Não usamos headers para evitar preflight OPTIONS
      response = await fetch(targetUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        body: JSON.stringify({ method: methodName, args: args })
      });
    } else {
      // GET "Simple Request" - O método mais compatível com redirecionamentos do Google
      const url = new URL(targetUrl);
      url.searchParams.append('method', methodName);
      url.searchParams.append('args', JSON.stringify(args));
      
      response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-store'
      });
    }

    if (!response.ok) {
      throw new Error(`Servidor retornou erro ${response.status}`);
    }

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      if (data && data.ok === false) throw new Error(data.error || 'Erro no Script');
      return data;
    } catch (parseError) {
      // Se falhar o parse, provavelmente o Google retornou uma página de erro HTML ou Login
      if (text.includes('google-signin') || text.includes('login') || text.includes('DOCTYPE html')) {
        throw new Error('Acesso Negado. Certifique-se que o Script está publicado como "Qualquer pessoa" (Anyone).');
      }
      console.error('Resposta não-JSON:', text);
      throw new Error('O Google retornou uma resposta inválida. Verifique se o código do Script está correto.');
    }

  } catch (e: any) {
    console.error('Fetch error detail:', e);
    
    // Tratamento amigável para o erro clássico
    if (e.message.includes('fetch') || e.name === 'TypeError') {
      throw new Error(
        'Falha de Rede (Failed to fetch). \n\n' +
        'Isso acontece se:\n' +
        '1. A URL não terminar em /exec\n' +
        '2. Você não publicou como "Qualquer pessoa" (Anyone)\n' +
        '3. Você está usando uma conta institucional (Workspace) que bloqueia scripts externos.'
      );
    }
    throw e;
  }
};

export const googleDriveService = {
  setApiUrl: (url: string) => {
    if (url) currentRuntimeApiUrl = url;
  },
  isApiConfigured: () => {
    return !!currentRuntimeApiUrl || !!(process.env as any).GOOGLE_API;
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
