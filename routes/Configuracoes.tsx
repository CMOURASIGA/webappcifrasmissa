
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Cloud, Check, AlertCircle, RefreshCw, Server, HelpCircle, Copy } from 'lucide-react';
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
    updateConfig({ gasApiUrl: gasUrl.trim() });
    alert('URL da API salva!');
  };

  const testDriveAccess = async () => {
    if (!driveId.trim()) return;
    setTestStatus({ loading: true });
    try {
      const result = await googleDriveService.testFolderAccess(driveId);
      if (result && result.ok) {
        setTestStatus({ ok: true, msg: `Conectado! Pasta: ${result.name} (${result.fileCount} músicas)` });
        updateConfig({ driveFolderId: driveId });
        await googleDriveService.setConfiguredFolderId(driveId);
      } else {
        setTestStatus({ ok: false, msg: result?.error || 'A pasta não pôde ser acessada.' });
      }
    } catch (e) {
      setTestStatus({ ok: false, msg: 'Erro técnico de conexão. Certifique-se de que o Script está publicado como "Qualquer pessoa" e não tem erros de código.' });
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

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Server size={20} className="text-purple-600" />
          <h2>1. Conexão com Backend (Google Script)</h2>
        </div>
        <p className="text-gray-500 text-sm">Cole o URL do seu Web App publicado no Google Apps Script.</p>
        
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
            Salvar URL
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl space-y-3">
          <h3 className="text-blue-800 font-bold text-sm flex items-center gap-2">
            <HelpCircle size={16} /> Instruções Importantes:
          </h3>
          <ul className="text-blue-700 text-xs space-y-1 list-disc pl-4">
            <li>No Script, clique em <b>Implantar > Nova implantação</b>.</li>
            <li>Tipo: <b>App da Web</b>.</li>
            <li>Quem pode acessar: <b>Qualquer pessoa</b> (isso é vital para o Vercel funcionar).</li>
            <li>O código deve conter a função <code>doGet(e)</code> que processe o parâmetro <code>method</code>.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Cloud size={20} className="text-blue-600" />
          <h2>2. Google Drive</h2>
        </div>
        <p className="text-gray-500 text-sm">Cole o ID ou o <b>link da pasta</b> do Drive que contém seus arquivos .txt.</p>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="text"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Ex: https://drive.google.com/drive/u/0/folders/..."
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
         <p className="text-xs font-bold uppercase tracking-widest">Cifras MISSA v1.2.2</p>
      </div>
    </div>
  );
};

export default Configuracoes;
