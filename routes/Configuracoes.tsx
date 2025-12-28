
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Layout, Cloud, Check, AlertCircle, RefreshCw, Link as LinkIcon, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig } = useApp();
  const [newCat, setNewCat] = useState('');
  const [driveId, setDriveId] = useState(config.driveFolderId || '');
  const [gasUrl, setGasUrl] = useState(config.gasApiUrl || '');
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean}>({});

  const handleAdd = () => {
    if (!newCat.trim()) return;
    addCategoria(newCat.trim());
    setNewCat('');
  };

  const saveGasUrl = () => {
    updateConfig({ gasApiUrl: gasUrl });
    alert('URL da API salva com sucesso!');
  };

  const testDriveAccess = async () => {
    if (!driveId.trim()) return;
    setTestStatus({ loading: true });
    try {
      const result = await googleDriveService.testFolderAccess(driveId);
      if (result.ok) {
        setTestStatus({ ok: true, msg: `Conectado a: ${result.name} (${result.fileCount} arquivos encontrados)` });
        updateConfig({ driveFolderId: driveId });
        await googleDriveService.setConfiguredFolderId(driveId);
      } else {
        setTestStatus({ ok: false, msg: result.error || 'Erro desconhecido' });
      }
    } catch (e) {
      setTestStatus({ ok: false, msg: 'Erro na comunicação. Verifique se o URL da API está correto e se o Web App foi publicado como "Qualquer pessoa".' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      {/* Configuração de API para Vercel */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Server size={20} className="text-purple-600" />
          <h2>Conexão com Backend (Vercel)</h2>
        </div>
        <p className="text-gray-500 text-sm">Para rodar fora do Google (Vercel), você precisa publicar seu Script como Web App e colar o URL aqui.</p>
        
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={gasUrl}
            onChange={e => setGasUrl(e.target.value)}
          />
          <button 
            onClick={saveGasUrl}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            Salvar API
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Cloud size={20} className="text-blue-600" />
          <h2>Google Drive</h2>
        </div>
        <p className="text-gray-500 text-sm">Configure o ID da pasta do Drive com suas cifras.</p>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="text"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="ID da Pasta do Drive"
              value={driveId}
              onChange={e => setDriveId(e.target.value)}
            />
            <button 
              onClick={testDriveAccess}
              disabled={testStatus.loading || !gasUrl}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {testStatus.loading ? <RefreshCw className="animate-spin" size={18} /> : 'Conectar'}
            </button>
          </div>
          
          {!gasUrl && <p className="text-amber-600 text-[10px] font-bold">⚠️ Configure o URL da API acima antes de conectar ao Drive.</p>}

          {testStatus.msg && (
            <div className={`p-3 rounded-xl flex items-start gap-2 text-sm ${testStatus.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testStatus.ok ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{testStatus.msg}</span>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias Litúrgicas</h2>
        </div>
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nova categoria"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
          />
          <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Adicionar</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700">{cat.nome}</span>
              <button onClick={() => confirm(`Excluir "${cat.nome}"?`) && deleteCategoria(cat.id)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center pt-8 border-t border-gray-100 text-gray-400">
         <p className="text-xs font-bold uppercase tracking-widest">Cifras MISSA v1.2.0 (Vercel Ready)</p>
         {config.lastSync && <p className="text-[10px] mt-1">Sincronizado: {new Date(config.lastSync).toLocaleString()}</p>}
      </div>
    </div>
  );
};

export default Configuracoes;
