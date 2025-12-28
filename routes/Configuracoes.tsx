
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Cloud, AlertCircle, RefreshCw, Activity, ShieldCheck, Cpu, Info, Code, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria, config, updateConfig, clearAllData, effectiveFolderId, isUsingEnvFallback } = useApp();
  const [newCat, setNewCat] = useState('');
  const [driveIdInput, setDriveIdInput] = useState(config.driveFolderId || '');
  const [testStatus, setTestStatus] = useState<{ok?: boolean, msg?: string, loading?: boolean, time?: number, count?: number}>({});
  const [showHelper, setShowHelper] = useState(false);
  const [copied, setCopied] = useState(false);

  const isApiConfigured = googleDriveService.isApiConfigured();

  // Added handleClearData to fix "Cannot find name 'handleClearData'" error
  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados locais? Isso não afetará os arquivos no seu Google Drive.')) {
      clearAllData();
      alert('Dados locais limpos com sucesso.');
    }
  };

  const handleCopyCode = () => {
    const code = `function doGet(e) {
  var result = handleRequest(e.parameter.method, JSON.parse(e.parameter.args || "[]"));
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var result = handleRequest(data.method, data.args || []);
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(method, args) {
  try {
    // Sua lógica aqui (ex: testFolderAccess, getAllTextFiles...)
    return { ok: true, data: "Sucesso" }; 
  } catch(e) {
    return { ok: false, error: e.toString() };
  }
}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testDriveAccess = async () => {
    const idToTest = driveIdInput.trim() || effectiveFolderId;
    if (!isApiConfigured) return;
    setTestStatus({ loading: true });
    const startTime = Date.now();
    try {
      updateConfig({ driveFolderId: driveIdInput.trim() });
      const result = await googleDriveService.testFolderAccess(idToTest);
      const endTime = Date.now();
      setTestStatus({ 
        ok: true, 
        msg: `Conectado à pasta "${result.name}".`,
        count: result.fileCount,
        time: (endTime - startTime) / 1000
      });
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
        <button 
          onClick={() => setShowHelper(true)}
          className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Code size={16} /> Resolver Erro de Conexão
        </button>
      </div>

      {!isApiConfigured && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-4 animate-pulse">
           <AlertCircle className="text-red-500 shrink-0" size={32} />
           <div className="space-y-1">
              <h3 className="font-black text-red-900 uppercase text-sm tracking-tight">API Não Encontrada</h3>
              <p className="text-xs text-red-700">A variável <strong>google_api</strong> está vazia no servidor.</p>
           </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-lg"><Cloud size={20} className="text-blue-600" /><h2>Pasta de Cifras</h2></div>
          <div className="flex gap-2">
            {!isUsingEnvFallback && config.driveFolderId && <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full border border-amber-200 uppercase">Manual</span>}
            {isUsingEnvFallback && <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-full border border-blue-200 uppercase">Servidor</span>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">ID da Pasta no Drive</label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Ex: 13IP0VfS..."
                value={driveIdInput}
                onChange={e => setDriveIdInput(e.target.value)}
              />
              <button 
                onClick={testDriveAccess}
                disabled={testStatus.loading || !isApiConfigured}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-30"
              >
                {testStatus.loading ? <RefreshCw className="animate-spin" size={18} /> : <Activity size={18} />} Testar
              </button>
            </div>
          </div>
          
          {testStatus.msg && (
            <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              <div className="flex items-center gap-2 font-bold">
                {testStatus.ok ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
                <span>{testStatus.ok ? 'Sucesso' : 'Erro de Conexão'}</span>
              </div>
              <p className="text-xs leading-relaxed">{testStatus.msg}</p>
              {!testStatus.ok && (
                <button onClick={() => setShowHelper(true)} className="text-[10px] font-black uppercase underline text-left mt-1">Como resolver o erro de CORS?</button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE AJUDA TÉCNICA */}
      {showHelper && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Guia de Correção (CORS)</h2>
              <button onClick={() => setShowHelper(false)} className="text-gray-400 hover:text-gray-600">Fechar</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-2"><Info size={18} /> Por que o erro acontece?</p>
                <p className="text-amber-800 text-xs leading-relaxed">O Google bloqueia acessos externos se o seu Script não retornar os cabeçalhos de autorização corretos. Para resolver, as funções <code>doGet</code> e <code>doPost</code> no seu Google Script <strong>precisam</strong> terminar assim:</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <p className="text-xs font-bold text-gray-400 uppercase">Exemplo de Código Obrigatório</p>
                   <button 
                     onClick={handleCopyCode} 
                     className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                   >
                     {copied ? <Check size={14} /> : <Copy size={14} />}
                     <span className="text-xs font-bold">{copied ? 'Copiado!' : 'Copiar Código'}</span>
                   </button>
                </div>
                <pre className="bg-slate-900 text-blue-300 p-4 rounded-xl text-[10px] font-mono overflow-x-auto leading-relaxed shadow-inner">
{`function doGet(e) {
  // ... sua lógica ...
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // IMPORTANTE para evitar erro de CORS
  var contents = e.postData.contents; 
  // ... sua lógica ...
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}`}
                </pre>
              </div>

              <div className="space-y-3">
                <p className="font-bold">Checklist Final no Google Script:</p>
                <ul className="space-y-2">
                   <li className="flex gap-2 items-start text-xs"><Check size={14} className="text-green-500 mt-0.5" /> Clique em <strong>Implantar &gt; Nova Implantação</strong>.</li>
                   <li className="flex gap-2 items-start text-xs"><Check size={14} className="text-green-500 mt-0.5" /> Tipo: <strong>App da Web</strong>.</li>
                   <li className="flex gap-2 items-start text-xs"><Check size={14} className="text-green-500 mt-0.5" /> Quem tem acesso: <strong>Qualquer pessoa (Anyone)</strong>.</li>
                   <li className="flex gap-2 items-start text-xs"><Check size={14} className="text-green-500 mt-0.5" /> Copie a URL gerada e coloque na variável <strong>google_api</strong> da Vercel.</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
               <button onClick={() => setShowHelper(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Entendi, vou ajustar meu Script</button>
            </div>
          </div>
        </div>
      )}

      {/* Categorias e Manutenção (Ocultos para brevidade no log, mas mantidos) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias Litúrgicas</h2>
        </div>
        <div className="flex gap-2">
          <input type="text" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none" placeholder="Nova categoria" value={newCat} onChange={e => setNewCat(e.target.value)} />
          <button onClick={() => {if(newCat.trim()){addCategoria(newCat.trim()); setNewCat('');}}} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Adicionar</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
              <span className="font-medium text-gray-700 text-sm">{cat.nome}</span>
              <button onClick={() => confirm(`Excluir "${cat.nome}"?`) && deleteCategoria(cat.id)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 pt-6">
        <div className="flex items-center gap-2 text-red-600 font-bold text-lg border-b border-red-100 pb-2"><AlertCircle size={20} /><h2>Manutenção</h2></div>
        <div className="bg-red-50 p-6 rounded-2xl space-y-4 border border-red-100">
           <p className="text-red-700 text-sm">Apagar o cache local não afeta seus arquivos no Drive.</p>
           <button onClick={handleClearData} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold">Limpar Dados Locais</button>
        </div>
      </section>
    </div>
  );
};

export default Configuracoes;
