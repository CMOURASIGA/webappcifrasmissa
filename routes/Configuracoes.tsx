
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Cloud, Check, AlertCircle, RefreshCw, Server, HelpCircle, Activity, ShieldCheck, Cpu, Info, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig, clearAllData, effectiveFolderId, isUsingEnvFallback } = useApp();
  const [newCat, setNewCat] = useState('');
  const [driveIdInput, setDriveIdInput] = useState(config.driveFolderId || '');
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean, time?: number, count?: number}>({});
  
  const isApiConfigured = googleDriveService.isApiConfigured();

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

  const testDriveAccess = async () => {
    const idToTest = driveIdInput.trim() || effectiveFolderId;
    
    if (!isApiConfigured) {
      setTestStatus({ ok: false, msg: 'ERRO CRÍTICO: A URL da API (google_api) não foi definida nas variáveis de ambiente do servidor.' });
      return;
    }

    if (!idToTest) {
      alert('Nenhum ID configurado no sistema ou no servidor.');
      return;
    }
    
    setTestStatus({ loading: true });
    const startTime = Date.now();
    
    try {
      // Salva preventivamente
      updateConfig({ driveFolderId: driveIdInput.trim() });
      
      const result = await googleDriveService.testFolderAccess(idToTest);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (result && result.ok) {
        setTestStatus({ 
          ok: true, 
          msg: `Conectado com sucesso à pasta "${result.name}".`,
          count: result.fileCount,
          time: duration
        });
        await googleDriveService.setConfiguredFolderId(idToTest);
      } else {
        setTestStatus({ ok: false, msg: result?.error || 'A pasta não pôde ser acessada. Verifique se o ID está correto e se o script tem permissão.' });
      }
    } catch (e: any) {
      setTestStatus({ ok: false, msg: e.message || 'Erro de conexão desconhecido.' });
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

      {/* ALERTA DE API CONFIGURADA */}
      {!isApiConfigured && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-4 animate-pulse">
           <AlertCircle className="text-red-500 shrink-0" size={32} />
           <div className="space-y-1">
              <h3 className="font-black text-red-900 uppercase text-sm tracking-tight">Backend Desconectado</h3>
              <p className="text-xs text-red-700 leading-relaxed">
                A variável <strong>google_api</strong> não foi encontrada. O sistema não consegue falar com o Google. 
                Configure a URL do seu Script no painel da Vercel ou no seu arquivo .env.
              </p>
           </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <Cloud size={20} className="text-blue-600" />
            <h2>Pasta de Cifras</h2>
          </div>
          <div className="flex gap-2">
            {!isUsingEnvFallback && config.driveFolderId && (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-amber-200">
                MANDATÓRIO: Manual
              </span>
            )}
            {isUsingEnvFallback && (
              <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-blue-200">
                <Cpu size={10} /> FALLBACK: Servidor
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Info size={18} className="text-slate-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                Prioridade: O <strong>ID Manual</strong> abaixo sempre será usado primeiro. Se você deixá-lo vazio, o sistema usará o ID padrão configurado pelo administrador no servidor.
              </p>
              {isUsingEnvFallback && (
                <p className="text-[10px] font-mono text-blue-600 font-bold break-all">
                  Usando agora: {effectiveFolderId}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">ID de Configuração Manual</label>
            <div className="flex gap-2">
              <input 
                type="text"
                className={`flex-1 px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-all ${
                  !isUsingEnvFallback ? 'border-amber-300 ring-2 ring-amber-50 shadow-sm' : 'border-gray-200'
                }`}
                placeholder={isUsingEnvFallback ? "Vazio (usando padrão do servidor)" : "Insira o ID da pasta"}
                value={driveIdInput}
                onChange={e => setDriveIdInput(e.target.value)}
              />
              <button 
                onClick={testDriveAccess}
                disabled={testStatus.loading || !isApiConfigured}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                {testStatus.loading ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />}
                Testar & Salvar
              </button>
            </div>
            {!driveIdInput && isUsingEnvFallback && (
              <p className="text-[10px] text-gray-400 italic">O campo acima está vazio, portanto o sistema está buscando o ID global.</p>
            )}
          </div>
          
          {testStatus.msg && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300 ${
              testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {testStatus.ok ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                <span>{testStatus.ok ? 'Diagnóstico OK' : 'Falha na Conexão'}</span>
              </div>
              <p className="text-xs leading-relaxed">{testStatus.msg}</p>
              
              {!testStatus.ok && isApiConfigured && (
                <div className="mt-2 p-3 bg-white/50 rounded-lg text-[10px] space-y-1 border border-red-100">
                   <p className="font-bold uppercase opacity-60">Dicas para resolver:</p>
                   <ul className="list-disc pl-4 space-y-1">
                     <li>Verifique se o ID da pasta está correto (ex: 13IP0Vf...).</li>
                     <li>Abra o Google Script, clique em <strong>Implantar (Deploy)</strong> e garanta que está como <strong>Qualquer pessoa (Anyone)</strong>.</li>
                     <li>Verifique se a pasta no Drive tem permissões de leitura.</li>
                   </ul>
                </div>
              )}

              {testStatus.ok && (
                <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-green-200/50">
                  <div>
                    <span className="block text-[10px] uppercase font-bold opacity-60">Arquivos .txt</span>
                    <span className="text-lg font-black">{testStatus.count}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold opacity-60">Velocidade</span>
                    <span className="text-lg font-black">{testStatus.time?.toFixed(2)}s</span>
                  </div>
                </div>
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
          <h2>Manutenção</h2>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl space-y-4 border border-red-100">
           <p className="text-red-700 text-sm">Apagar o cache local não afeta seus arquivos no Drive, apenas remove as cópias do navegador.</p>
           <button 
             onClick={handleClearData}
             className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
           >
             Limpar Dados Locais
           </button>
        </div>
      </section>
    </div>
  );
};

export default Configuracoes;
