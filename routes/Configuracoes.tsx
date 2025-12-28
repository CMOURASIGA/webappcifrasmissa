import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Cloud, Check, AlertCircle, RefreshCw, Server, HelpCircle, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig, clearAllData } = useApp();
  const [newCat, setNewCat] = useState('');
  const [driveId, setDriveId] = useState(config.driveFolderId || '');
  const [gasUrl, setGasUrl] = useState(config.gasApiUrl || '');
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean, time?: number, count?: number}>({});

  const handleAdd = () => {
    if (!newCat.trim()) return;
    addCategoria(newCat.trim());
    setNewCat('');
  };

  const handleClearData = () => {
    if (confirm('Atenção: Isso excluirá todas as músicas e listas salvas LOCALMENTE. Os arquivos no seu Google Drive não serão afetados. Deseja continuar?')) {
      clearAllData();
      alert('Dados locais limpos.');
    }
  };

  const saveGasUrl = () => {
    updateConfig({ gasApiUrl: gasUrl.trim() });
    alert('URL da API salva!');
  };

  const testDriveAccess = async () => {
    if (!driveId.trim() || !gasUrl.trim()) {
      alert('Configure a URL da API e o ID da pasta primeiro.');
      return;
    }
    
    setTestStatus({ loading: true });
    const startTime = Date.now();
    
    try {
      // Primeiro salvamos as configurações para garantir que o serviço use os dados atuais
      updateConfig({ gasApiUrl: gasUrl.trim(), driveFolderId: driveId.trim() });
      
      const result = await googleDriveService.testFolderAccess(driveId);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (result && result.ok) {
        setTestStatus({ 
          ok: true, 
          msg: `Sucesso! Conectado à pasta "${result.name}".`,
          count: result.fileCount,
          time: duration
        });
        await googleDriveService.setConfiguredFolderId(driveId);
      } else {
        setTestStatus({ ok: false, msg: result?.error || 'A pasta não pôde ser acessada.' });
      }
    } catch (e: any) {
      setTestStatus({ ok: false, msg: e.message || 'Erro de conexão.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10 pb-20">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Server size={20} className="text-purple-600" />
          <h2>1. API do Google Script</h2>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase">URL do Web App</label>
          <div className="flex gap-2">
            <input 
              type="text"
              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={gasUrl}
              onChange={e => setGasUrl(e.target.value)}
            />
            <button 
              onClick={saveGasUrl}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Cloud size={20} className="text-blue-600" />
          <h2>2. Pasta de Cifras (Google Drive)</h2>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">ID ou Link da Pasta</label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="ID da pasta no Drive"
                value={driveId}
                onChange={e => setDriveId(e.target.value)}
              />
              <button 
                onClick={testDriveAccess}
                disabled={testStatus.loading || !gasUrl}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {testStatus.loading ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
                Testar Carga
              </button>
            </div>
          </div>
          
          {testStatus.msg && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {testStatus.ok ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                <span>{testStatus.ok ? 'Diagnóstico Concluído' : 'Falha no Diagnóstico'}</span>
              </div>
              <p className="text-sm">{testStatus.msg}</p>
              {testStatus.ok && (
                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-green-200/50">
                  <div>
                    <span className="block text-[10px] uppercase font-bold opacity-60">Arquivos Encontrados</span>
                    <span className="text-lg font-black">{testStatus.count}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold opacity-60">Tempo de Resposta</span>
                    <span className="text-lg font-black">{testStatus.time?.toFixed(2)}s</span>
                  </div>
                </div>
              )}
              {!testStatus.ok && (
                <p className="text-xs opacity-80 mt-1 italic">
                  Dica: Verifique se o ID da pasta está correto e se o Script foi publicado com acesso para "Qualquer pessoa".
                </p>
              )}
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
            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nova categoria"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
          />
          <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Adicionar</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700 text-sm truncate">{cat.nome}</span>
              <button onClick={() => confirm(`Excluir "${cat.nome}"?`) && deleteCategoria(cat.id)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 pt-6">
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg border-b border-red-100 pb-2">
          <AlertCircle size={20} />
          <h2>Zona de Perigo</h2>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl space-y-4 border border-red-100">
           <p className="text-red-700 text-sm">Esta ação removerá apenas as cópias locais. O Drive permanecerá intacto.</p>
           <button 
             onClick={handleClearData}
             className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
           >
             Limpar Cache Local
           </button>
        </div>
      </section>

      <div className="text-center pt-8 text-gray-400">
         <p className="text-[10px] font-bold uppercase tracking-widest">Cifras MISSA - Edição Pro Performance</p>
      </div>
    </div>
  );
};

export default Configuracoes;