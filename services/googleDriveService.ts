
/**
 * Este serviço detecta se está rodando dentro do Google ou no Vercel.
 * Se estiver no Vercel, utiliza fetch() para o Web App do Google.
 */

declare const google: any;

// Função auxiliar para obter o URL da API salvo no localStorage
const getApiUrl = () => {
  try {
    const config = JSON.parse(localStorage.getItem('cifras_missa_config') || '{}');
    return config.gasApiUrl || '';
  } catch (e) {
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

  // 2. Se estivermos no Vercel (ou local), usamos fetch para o Web App publicado
  const apiUrl = getApiUrl();
  if (!apiUrl) {
    console.warn("API URL não configurada para ambiente externo.");
    // Fallback para desenvolvimento local
    return { ok: false, error: 'API do Google não configurada nas definições.' };
  }

  try {
    // Para contornar CORS no GAS, geralmente usamos uma requisição GET com parâmetros
    // ou um POST se o GAS estiver configurado para aceitar.
    // Aqui simulamos o padrão do GAS Web App:
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors', // O GAS tem restrições de CORS, 'no-cors' permite o envio mas não a leitura da resposta direta.
      // DICA: Para Vercel -> GAS, o ideal é usar uma biblioteca como 'gas-client' ou 
      // configurar o GAS para retornar ContentService.MimeType.JSON com os headers corretos.
      body: JSON.stringify({ method: methodName, args: args })
    });
    
    // Como o GAS com 'no-cors' não permite ler o JSON de volta facilmente, 
    // a melhor prática para o Vercel é o seu Web App do Google suportar CORS.
    // Assumindo que você configurou o GAS com as permissões corretas:
    const corsResponse = await fetch(`${apiUrl}?method=${methodName}&args=${encodeURIComponent(JSON.stringify(args))}`);
    return await corsResponse.json();
  } catch (e) {
    console.error(`Erro ao chamar API ${methodName}:`, e);
    throw e;
  }
};

export const googleDriveService = {
  getConfiguredFolderId: () => run('getConfiguredFolderId'),
  setConfiguredFolderId: (id: string) => run('setConfiguredFolderId', id),
  testFolderAccess: (id: string) => run('testFolderAccess', id),
  getAllTextFiles: () => run('getAllTextFiles'),
  getUserLists: () => run('getUserLists'),
  saveUserLists: (lists: any[]) => run('saveUserLists', lists),
  getUserMeta: () => run('getUserMeta'),
  saveUserMeta: (meta: any) => run('saveUserMeta', meta),
};
