
/**
 * Este serviço gerencia a comunicação com o Google Apps Script.
 * Otimizado para máxima compatibilidade com as políticas de segurança do Google.
 */

declare const google: any;

const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  // Remove espaços, quebras de linha e caracteres de controle
  return url.trim().replace(/[\n\r\s\t]/g, '');
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
  // 1. Suporte nativo se estiver dentro do ambiente Google
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[methodName](...args);
    });
  }

  // 2. Conexão via Web (Vercel)
  if (!currentRuntimeApiUrl) {
    throw new Error('Configure a URL da API nos Ajustes.');
  }

  const targetUrl = sanitizeUrl(currentRuntimeApiUrl);

  // Verificação de URL de Editor vs Execução
  if (targetUrl.includes('/edit')) {
    throw new Error('Você usou a URL de Edição. Use a URL de "Implantação" que termina em /exec');
  }

  try {
    /**
     * ESTRATÉGIA DE CONEXÃO ROBUSTA:
     * Usamos GET para quase tudo. O Google lida melhor com redirecionamentos de GET.
     * Não enviamos nenhum Header customizado (como Content-Type: application/json)
     * para evitar o Preflight OPTIONS que causa o "Failed to fetch".
     */
    const isLargeData = methodName === 'saveUserLists' && JSON.stringify(args).length > 1500;
    let response;

    if (isLargeData) {
      // POST para dados grandes (Listas extensas)
      response = await fetch(targetUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        // Enviamos como texto puro para o Google não bloquear
        body: JSON.stringify({ method: methodName, args: args })
      });
    } else {
      // GET para todo o resto (Sincronização, Testes, Metadados)
      const url = new URL(targetUrl);
      url.searchParams.append('method', methodName);
      url.searchParams.append('args', JSON.stringify(args));
      
      response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-cache'
      });
    }

    if (!response.ok) {
      throw new Error(`Erro do Google: ${response.status}`);
    }

    const text = await response.text();
    
    // Se a resposta for um HTML, o Google está pedindo login (Permissão Anyone não ativa)
    if (text.includes('<!DOCTYPE html>') || text.includes('google-signin')) {
      throw new Error('Acesso Negado. Verifique se publicou como "Qualquer pessoa" (Anyone).');
    }

    try {
      const data = JSON.parse(text);
      if (data && data.ok === false) throw new Error(data.error || 'Erro interno no Script');
      return data;
    } catch (e) {
      console.error('Resposta não-JSON recebida:', text.substring(0, 200));
      throw new Error('O Script não retornou um JSON. Verifique o código no Google.');
    }

  } catch (e: any) {
    console.error('Fetch Error Detail:', e);
    
    // Tratamento amigável do erro reportado
    if (e.message.includes('fetch') || e.name === 'TypeError') {
      throw new Error(
        'Falha de Conexão (Network Error).\n' +
        'Possíveis causas:\n' +
        '1. URL Inválida (verifique se termina em /exec)\n' +
        '2. Script Desativado ou Sem Permissão "Anyone"\n' +
        '3. Bloqueio de Firewall/VPN'
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
