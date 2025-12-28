
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Cloud, AlertCircle, RefreshCw, Activity, ShieldCheck, Info, Code, Link as LinkIcon, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig, clearAllData, effectiveFolderId, effectiveApiUrl } = useApp();
  const [newCat, setNewCat] = useState('');
  
  const [driveIdInput, setDriveIdInput] = useState(config.driveFolderId || '');
  const [apiUrlInput, setApiUrlInput] = useState(config.googleApiUrl || '');
  
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean}>({});
  const [showHelper, setShowHelper] = useState(false);

  const handleClearData = () => {
    if (window.confirm('Tem certeza? Isso apagará as cifras do celular, mas não do Drive.')) {
      clearAllData();
      alert('Dados locais limpos.');
    }
  };

  const saveManualConfigs = () => {
    updateConfig({ 
      driveFolderId: driveIdInput.trim(),
      googleApiUrl: apiUrlInput.trim() 
    });
    alert('Configurações salvas localmente!');
  };

  const testConnection = async () => {
    if (!apiUrlInput.trim() && !effectiveApiUrl) {
      alert('Configure a URL da API primeiro.');
      return;
    }
    
    setTestStatus({ loading: true });
    try {
      // Forçamos a URL no serviço para o teste
      const urlToTest = apiUrlInput.trim() || effectiveApiUrl;
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
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={24} /></Link>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        </div>
      </div>

      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <LinkIcon size={20} className="text-blue-600" />
          <h2>Conexão com Google Drive</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">URL do Google Script (API)</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={apiUrlInput}
              onChange={e => setApiUrlInput(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">ID da Pasta de Cifras</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="Ex: 13IP0VfS..."
              value={driveIdInput}
              onChange={e => setDriveIdInput(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={saveManualConfigs}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Salvar Ajustes
            </button>
            <button 
              onClick={testConnection}
              disabled={testStatus.loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {testStatus.loading ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />} Testar
            </button>
          </div>
        </div>

        {testStatus.msg && (
          <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {testStatus.ok ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
              <span>{testStatus.ok ? 'Conexão OK' : 'Falha na Conexão'}</span>
            </div>
            <p className="text-xs">{testStatus.msg}</p>
            {!testStatus.ok && (
              <button onClick={() => setShowHelper(true)} className="text-[10px] font-black uppercase underline text-left">Como resolver erro de CORS?</button>
            )}
          </div>
        )}
      </section>

      {/* MODAL DE AJUDA */}
      {showHelper && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-bold">Erro de CORS / Acesso</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Isso acontece quando o Google Script bloqueia o navegador. Para corrigir:
            </p>
            <ol className="text-xs space-y-2 list-decimal pl-4 text-gray-700">
              <li>No Google Script, clique em <strong>Implantar > Nova Implantação</strong>.</li>
              <li>Tipo: <strong>App da Web</strong>.</li>
              <li>Quem tem acesso: <strong className="text-red-600">Qualquer pessoa (Anyone)</strong>.</li>
              <li>Clique em Implantar e <strong>copie a nova URL</strong> gerada.</li>
            </ol>
            <button onClick={() => setShowHelper(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Entendi</button>
          </div>
        </div>
      )}

      {/* CATEGORIAS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias Litúrgicas</h2>
        </div>
        <div className="flex gap-2">
          <input type="text" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nova categoria" value={newCat} onChange={e => setNewCat(e.target.value)} />
          <button onClick={() => {if(newCat.trim()){addCategoria(newCat.trim()); setNewCat('');}}} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">Adicionar</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 group">
              <span className="font-medium text-gray-700 text-sm">{cat.nome}</span>
              <button onClick={() => confirm(`Excluir "${cat.nome}"?`) && deleteCategoria(cat.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* MANUTENÇÃO */}
      <section className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-4">
        <h2 className="text-red-600 font-bold flex items-center gap-2"><AlertCircle size={20} /> Perigo</h2>
        <p className="text-xs text-red-700">Apagar os dados locais resetará o app. As cifras no seu Drive não serão deletadas.</p>
        <button onClick={handleClearData} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold">Resetar Dados Locais</button>
      </section>
    </div>
  );
};

export default Configuracoes;
