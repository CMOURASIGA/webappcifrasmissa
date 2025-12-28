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
    throw new Error('URL da API não configurada nas Configurações.');
  }

  // Aumentado para 300 segundos (5 minutos) para suportar 241+ músicas.
  const TIMEOUT_MS = 300000; 
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const urlWithParams = new URL(apiUrl);
    urlWithParams.searchParams.append('method', methodName);
    urlWithParams.searchParams.append('args', JSON.stringify(args));

    console.log(`[GAS] Executando ${methodName} em ${apiUrl}...`);

    const response = await fetch(urlWithParams.toString(), {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) throw new Error('Web App não encontrado (404). Verifique se a URL da API está correta.');
      throw new Error(`Erro do Google (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (data && data.ok === false) {
      throw new Error(data.error || 'O Google retornou um erro interno.');
    }

    console.log(`[GAS] ${methodName} concluído com sucesso.`);
    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('O Google demorou mais de 5 minutos. Com 241 músicas, o processamento pode ser pesado. Tente dividir em pastas menores ou verifique a conexão.');
    }
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Bloqueio de CORS. Certifique-se de que publicou o Script como "App da Web" com acesso para "Qualquer pessoa".');
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