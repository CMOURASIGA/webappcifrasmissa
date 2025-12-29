
import React, { useState } from 'react';
import { ArrowLeft, Trash2, Tag, AlertCircle, RefreshCw, Activity, ShieldCheck, Link as LinkIcon, DownloadCloud, Save, X, Code, Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig, clearAllData, effectiveFolderId, effectiveApiUrl } = useApp();
  const [newCat, setNewCat] = useState('');
  
  const envApiUrl = (process.env as any).GOOGLE_API || '';
  const envDriveId = (process.env as any).DRIVE_FOLDER_ID || '';

  const [driveIdInput, setDriveIdInput] = useState(config.driveFolderId || envDriveId);
  const [apiUrlInput, setApiUrlInput] = useState(config.googleApiUrl || envApiUrl);
  
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean}>({});
  const [showHelper, setShowHelper] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const scriptCode = `// --- NOVO CÓDIGO DO GOOGLE APPS SCRIPT ---
// Substitua TODO o código do seu script por este:

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var method, args;
  
  // Detecta se os dados vieram via POST (corpo) ou GET (parâmetros)
  if (e.postData && e.postData.contents) {
    try {
      var payload = JSON.parse(e.postData.contents);
      method = payload.method;
      args = payload.args;
    } catch(err) {
      // Tenta ler como form data se falhar o JSON
      method = e.parameter.method;
      args = JSON.parse(e.parameter.args || "[]");
    }
  } else {
    method = e.parameter.method;
    args = JSON.parse(e.parameter.args || "[]");
  }

  if (!method || !this[method]) {
    return createResponse({ ok: false, error: "Método não encontrado: " + method });
  }

  try {
    var result = this[method].apply(this, args);
    return createResponse(result);
  } catch (err) {
    return createResponse({ ok: false, error: err.toString() });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- FUNÇÕES DE LÓGICA ---

function testFolderAccess(folderId) {
  var folder = DriveApp.getFolderById(folderId);
  return { ok: true, name: folder.getName() };
}

function setConfiguredFolderId(id) {
  PropertiesService.getScriptProperties().setProperty('folderId', id);
  return { ok: true };
}

function getAllTextFiles() {
  var folderId = PropertiesService.getScriptProperties().getProperty('folderId');
  if (!folderId) return [];
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFilesByType(MimeType.PLAIN_TEXT);
  var result = [];
  while (files.hasNext()) {
    var file = files.next();
    result.push({
      id: file.getId(),
      nome: file.getName().replace('.txt', ''),
      conteudo: file.getBlob().getDataAsString(),
      ultimaAtualizacao: file.getLastUpdated().toISOString()
    });
  }
  return result;
}

function getUserLists() {
  var data = PropertiesService.getScriptProperties().getProperty('userLists');
  return data ? JSON.parse(data) : [];
}

function saveUserLists(lists) {
  PropertiesService.getScriptProperties().setProperty('userLists', JSON.stringify(lists));
  return { ok: true };
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInvalidUrl = apiUrlInput.includes('/edit');

  const handleClearData = () => {
    if (window.confirm('Tem certeza? Isso apagará as cifras do celular, mas não do Drive.')) {
      clearAllData();
      alert('Dados locais limpos.');
    }
  };

  const saveManualConfigs = () => {
    const trimmedUrl = apiUrlInput.trim().replace(/[\n\r]/g, '');
    if (!trimmedUrl) {
      alert('A URL da API é necessária.');
      return;
    }
    
    if (trimmedUrl.includes('/edit')) {
      alert('ERRO: Você está usando a URL de edição do Script. Use a URL de IMPLANTAÇÃO (que termina em /exec).');
      return;
    }

    updateConfig({ 
      driveFolderId: driveIdInput.trim(),
      googleApiUrl: trimmedUrl 
    });
    
    googleDriveService.setApiUrl(trimmedUrl);
    alert('Configurações salvas!');
  };

  const testConnection = async () => {
    const urlToTest = apiUrlInput.trim() || effectiveApiUrl;
    if (!urlToTest) {
      setTestStatus({ ok: false, msg: 'Nenhuma URL configurada.' });
      return;
    }
    
    setTestStatus({ loading: true });
    try {
      googleDriveService.setApiUrl(urlToTest);
      const idToTest = driveIdInput.trim() || effectiveFolderId;
      const result = await googleDriveService.testFolderAccess(idToTest);
      setTestStatus({ ok: true, msg: `Conectado com sucesso! Pasta: ${result.name}` });
    } catch (e: any) {
      setTestStatus({ ok: false, msg: e.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>
        <button 
          onClick={() => setShowCode(true)}
          className="flex items-center gap-2 text-xs font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Code size={16} /> Código do Script
        </button>
      </div>

      <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <LinkIcon size={20} className="text-blue-600" />
          <h2>Conexão com Nuvem</h2>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase">URL da API (Deployment URL)</label>
              {isInvalidUrl && <span className="text-[10px] text-red-600 font-black animate-pulse">URL INCORRETA (/edit)</span>}
            </div>
            <input 
              type="text"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl outline-none focus:ring-2 font-mono text-xs transition-all ${
                isInvalidUrl ? 'border-red-300 ring-red-100 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
              }`}
              placeholder="https://script.google.com/macros/s/.../exec"
              value={apiUrlInput}
              onChange={e => setApiUrlInput(e.target.value)}
            />
            {isInvalidUrl && (
              <p className="text-[10px] text-red-500 mt-1 font-medium">Você colou a URL do editor. Clique em 'Implantar' no Google para obter a URL de execução.</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">ID da Pasta do Drive</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs transition-all"
              placeholder="Cole o ID da pasta (presente na URL da pasta)"
              value={driveIdInput}
              onChange={e => setDriveIdInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={saveManualConfigs}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              <Save size={20} /> Salvar Alterações
            </button>
            <button 
              onClick={testConnection}
              disabled={testStatus.loading}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
            >
              {testStatus.loading ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />} Testar Agora
            </button>
          </div>
        </div>

        {testStatus.msg && (
          <div className={`p-5 rounded-3xl border animate-in zoom-in duration-300 flex flex-col gap-2 ${testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {testStatus.ok ? <ShieldCheck size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
              <span>{testStatus.ok ? 'Sucesso!' : 'Falha Crítica'}</span>
            </div>
            <p className="text-xs whitespace-pre-line leading-relaxed opacity-90">{testStatus.msg}</p>
            {!testStatus.ok && (
              <button onClick={() => setShowHelper(true)} className="text-[10px] font-black uppercase underline text-left mt-3 text-red-600 hover:text-red-800">
                Ver Guia Anti-Erro de Fetch
              </button>
            )}
          </div>
        )}
      </section>

      {/* MODAL DO CÓDIGO - REDESENHADO */}
      {showCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[40px] flex flex-col max-h-[90vh] shadow-2xl overflow-hidden relative border border-white/20">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Script do Google</h2>
                <p className="text-xs text-gray-500 mt-1">Copie este código e substitua TODO o conteúdo no seu Editor de Script.</p>
              </div>
              <button onClick={() => setShowCode(false)} className="p-3 bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <div className="bg-slate-900 rounded-2xl p-6 font-mono text-[11px] text-blue-300 leading-relaxed overflow-x-auto shadow-inner">
                <pre className="whitespace-pre-wrap">{scriptCode}</pre>
              </div>
            </div>
            <div className="p-8 border-t border-gray-100 bg-white flex flex-col gap-3">
              <button 
                onClick={copyToClipboard}
                className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all transform active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700'}`}
              >
                {copied ? <Check size={24} /> : <Copy size={24} />}
                {copied ? 'CÓDIGO COPIADO!' : 'COPIAR CÓDIGO FONTE'}
              </button>
              <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">Lembre-se de clicar em "Implantar > Nova Implantação" após colar.</p>
            </div>
          </div>
        </div>
      )}

      {/* GUIA DE RESOLUÇÃO */}
      {showHelper && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[48px] p-10 shadow-2xl relative">
            <button onClick={() => setShowHelper(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Guia de Resolução</h2>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="bg-red-600 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-red-200">1</div>
                <div>
                  <p className="text-base font-bold text-gray-900">A URL do Script é a correta?</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Não use a URL do navegador. Use a URL que o Google fornece quando você clica em <strong>Implantar &gt; Nova Implantação</strong>. Ela deve terminar obrigatoriamente em <code>/exec</code>.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-blue-200">2</div>
                <div>
                  <p className="text-base font-bold text-gray-900">Publicação para Todos</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Na tela de implantação, em <strong>"Quem tem acesso"</strong>, você PRECISA selecionar <strong>Qualquer Pessoa (Anyone)</strong>. Se selecionar "Qualquer pessoa com conta Google", o erro de fetch persistirá.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="bg-slate-900 text-white w-8 h-8 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-slate-200">3</div>
                <div>
                  <p className="text-base font-bold text-gray-900">Aba Anônima Real</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Muitas vezes o Google bloqueia o redirecionamento se você estiver logado em mais de uma conta Gmail. Testar em Aba Anônima limpa esses conflitos temporariamente.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowHelper(false)} className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-black shadow-2xl shadow-slate-200 transform active:scale-95 transition-transform">ENTENDIDO, VOU REVISAR</button>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias</h2>
        </div>
        <div className="flex gap-2">
          <input type="text" className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ex: Comunhão, Salmo..." value={newCat} onChange={e => setNewCat(e.target.value)} />
          <button onClick={() => {if(newCat.trim()){addCategoria(newCat.trim()); setNewCat('');}}} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">Adicionar</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
              <span className="font-bold text-gray-700 text-sm">{cat.nome}</span>
              <button onClick={() => confirm(`Excluir "${cat.nome}"?`) && deleteCategoria(cat.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-red-50 p-8 rounded-[40px] border border-red-100 space-y-4">
        <h2 className="text-red-600 font-black flex items-center gap-2 uppercase tracking-widest text-xs"><AlertCircle size={20} /> Atenção</h2>
        <p className="text-xs text-red-700 font-medium leading-relaxed">Apagar os dados locais resetará o app. Suas cifras no Google Drive continuarão lá, mas suas configurações locais e listas não sincronizadas serão perdidas.</p>
        <button onClick={handleClearData} className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-100 active:scale-95">RESETAR APLICATIVO</button>
      </section>
    </div>
  );
};

export default Configuracoes;
