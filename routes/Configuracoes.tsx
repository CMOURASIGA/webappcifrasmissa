
import React, { useState } from 'react';
import { ArrowLeft, Trash2, Tag, AlertCircle, RefreshCw, Activity, ShieldCheck, Link as LinkIcon, DownloadCloud, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig, clearAllData, effectiveFolderId, effectiveApiUrl } = useApp();
  const [newCat, setNewCat] = useState('');
  
  // Variáveis do Vercel/Ambiente
  const envApiUrl = (process.env as any).GOOGLE_API || '';
  const envDriveId = (process.env as any).DRIVE_FOLDER_ID || '';

  // Se o config estiver vazio, usamos os valores do ambiente como padrão inicial do estado
  const [driveIdInput, setDriveIdInput] = useState(config.driveFolderId || envDriveId);
  const [apiUrlInput, setApiUrlInput] = useState(config.googleApiUrl || envApiUrl);
  
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean}>({});
  const [showHelper, setShowHelper] = useState(false);

  const hasEnvData = !!(envApiUrl || envDriveId);
  // Verifica se o que está nos inputs é diferente do que veio do Vercel (para mostrar o banner de importação)
  const isDataDifferentFromEnv = (apiUrlInput !== envApiUrl && envApiUrl !== '') || (driveIdInput !== envDriveId && envDriveId !== '');

  const handleClearData = () => {
    if (window.confirm('Tem certeza? Isso apagará as cifras do celular, mas não do Drive.')) {
      clearAllData();
      alert('Dados locais limpos.');
    }
  };

  const loadFromEnv = () => {
    if (envApiUrl) setApiUrlInput(envApiUrl);
    if (envDriveId) setDriveIdInput(envDriveId);
  };

  const saveManualConfigs = () => {
    const trimmedUrl = apiUrlInput.trim();
    if (!trimmedUrl) {
      alert('A URL da API é necessária.');
      return;
    }
    
    updateConfig({ 
      driveFolderId: driveIdInput.trim(),
      googleApiUrl: trimmedUrl 
    });
    
    googleDriveService.setApiUrl(trimmedUrl);
    alert('Configurações salvas no WebApp com sucesso!');
  };

  const testConnection = async () => {
    const urlToTest = apiUrlInput.trim() || effectiveApiUrl;
    if (!urlToTest) {
      setTestStatus({ ok: false, msg: 'Nenhuma URL de API configurada.' });
      return;
    }
    
    setTestStatus({ loading: true });
    try {
      googleDriveService.setApiUrl(urlToTest);
      const idToTest = driveIdInput.trim() || effectiveFolderId;
      const result = await googleDriveService.testFolderAccess(idToTest);
      setTestStatus({ ok: true, msg: `Conectado com sucesso à pasta: ${result.name}` });
    } catch (e: any) {
      setTestStatus({ ok: false, msg: e.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>
      </div>

      {/* BANNER DE IMPORTAÇÃO - SÓ APARECE SE AS VARIÁVEIS FOREM DIFERENTES DO INPUT */}
      {hasEnvData && isDataDifferentFromEnv && (
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center gap-6 animate-in zoom-in duration-300">
          <div className="bg-white/20 p-4 rounded-2xl">
            <DownloadCloud size={32} />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="font-bold text-lg">Valores do Servidor encontrados</h3>
            <p className="text-blue-100 text-sm">Detectamos que você configurou variáveis no Vercel. Clique em "Carregar" para preencher os campos automaticamente.</p>
          </div>
          <button 
            onClick={loadFromEnv}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors whitespace-nowrap active:scale-95"
          >
            Carregar Dados
          </button>
        </div>
      )}

      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <LinkIcon size={20} className="text-blue-600" />
          <h2>Conexão com Google Drive</h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase">URL da API (Google Script)</label>
              {apiUrlInput === envApiUrl && envApiUrl !== '' && (
                <span className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1">
                  <ShieldCheck size={12} /> Sincronizado com Servidor
                </span>
              )}
            </div>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={apiUrlInput}
              onChange={e => setApiUrlInput(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-[10px] font-black text-gray-400 uppercase">ID da Pasta</label>
              {driveIdInput === envDriveId && envDriveId !== '' && (
                <span className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1">
                  <ShieldCheck size={12} /> Sincronizado com Servidor
                </span>
              )}
            </div>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="ID da pasta no final do link do Drive"
              value={driveIdInput}
              onChange={e => setDriveIdInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={saveManualConfigs}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Save size={20} /> Salvar no WebApp
            </button>
            <button 
              onClick={testConnection}
              disabled={testStatus.loading}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {testStatus.loading ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />} Testar Conexão
            </button>
          </div>
        </div>

        {testStatus.msg && (
          <div className={`p-5 rounded-2xl border flex flex-col gap-2 ${testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {testStatus.ok ? <ShieldCheck size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
              <span>{testStatus.ok ? 'Conexão OK' : 'Falha na Conexão'}</span>
            </div>
            <p className="text-xs whitespace-pre-line">{testStatus.msg}</p>
            {!testStatus.ok && (
              <button onClick={() => setShowHelper(true)} className="text-[10px] font-black uppercase underline text-left mt-1 text-red-600">
                Ver como resolver o erro "Failed to fetch"
              </button>
            )}
          </div>
        )}
      </section>

      {showHelper && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-8 shadow-2xl relative">
            <button onClick={() => setShowHelper(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
               <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black text-gray-900 mb-6">Como Resolver o "Failed to fetch"</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Verifique a Publicação</p>
                  <p className="text-xs text-gray-500">No Google Script, clique em <strong>Implantar &gt; Gerenciar implantações</strong> e garanta que em "Quem tem acesso" esteja escrito: <strong>Qualquer pessoa (Anyone)</strong>.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Múltiplas Contas Google</p>
                  <p className="text-xs text-gray-500">Se você estiver logado em mais de um Gmail no mesmo navegador, o redirecionamento do Google falha. <strong>Tente acessar o app em uma Aba Anônima</strong> para testar.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">3</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nova URL</p>
                  <p className="text-xs text-gray-500">Sempre que você altera o código no Google Script, você deve gerar uma <strong>Nova Implantação</strong> e copiar a nova URL gerada, pois a antiga para de funcionar.</p>
                </div>
              </div>
            </div>

            <button onClick={() => setShowHelper(false)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold">Entendi, vou verificar</button>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias</h2>
        </div>
        <div className="flex gap-2">
          <input type="text" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nova categoria" value={newCat} onChange={e => setNewCat(e.target.value)} />
          <button onClick={() => {if(newCat.trim()){addCategoria(newCat.trim()); setNewCat('');}}} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">Add</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 group">
              <span className="font-medium text-gray-700 text-sm">{cat.nome}</span>
              <button onClick={() => confirm(`Excluir "${cat.nome}"?`) && deleteCategoria(cat.id)} className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-red-50 p-6 rounded-[32px] border border-red-100 space-y-4">
        <h2 className="text-red-600 font-bold flex items-center gap-2"><AlertCircle size={20} /> Zona de Perigo</h2>
        <p className="text-xs text-red-700">Apagar os dados locais resetará o app completamente neste aparelho. Seus arquivos no Drive estão protegidos.</p>
        <button onClick={handleClearData} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-colors">Resetar App</button>
      </section>
    </div>
  );
};

export default Configuracoes;
