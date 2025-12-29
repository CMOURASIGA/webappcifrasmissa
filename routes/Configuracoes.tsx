
import React, { useState } from 'react';
import { ArrowLeft, Trash2, Tag, AlertCircle, RefreshCw, Activity, ShieldCheck, Link as LinkIcon, DownloadCloud, Save, X, Code, Copy, Check } from 'lucide-react';
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

  // Código atualizado para o Google Apps Script para lidar com GET/POST
  const scriptCode = `function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  var method, args;
  if (e.postData && e.postData.contents) {
    try {
      var payload = JSON.parse(e.postData.contents);
      method = payload.method;
      args = payload.args;
    } catch(ex) {
      method = e.parameter.method;
      args = JSON.parse(e.parameter.args || "[]");
    }
  } else {
    method = e.parameter.method;
    args = JSON.parse(e.parameter.args || "[]");
  }

  try {
    var result = this[method].apply(this, args);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testFolderAccess(id) {
  var folder = DriveApp.getFolderById(id);
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
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveManualConfigs = () => {
    const cleanUrl = apiUrlInput.trim().replace(/[\n\r\s\t]/g, '');
    if (!cleanUrl) {
      alert('URL da API é obrigatória.');
      return;
    }
    
    updateConfig({ 
      driveFolderId: driveIdInput.trim(),
      googleApiUrl: cleanUrl 
    });
    
    googleDriveService.setApiUrl(cleanUrl);
    alert('Ajustes salvos com sucesso!');
  };

  const testConnection = async () => {
    const urlToTest = apiUrlInput.trim().replace(/[\n\r\s\t]/g, '') || effectiveApiUrl;
    if (!urlToTest) {
      setTestStatus({ ok: false, msg: 'Nenhuma URL configurada.' });
      return;
    }
    
    setTestStatus({ loading: true });
    try {
      googleDriveService.setApiUrl(urlToTest);
      const idToTest = driveIdInput.trim() || effectiveFolderId;
      const result = await googleDriveService.testFolderAccess(idToTest);
      setTestStatus({ ok: true, msg: `Conexão estabelecida com sucesso! Pasta: ${result.name}` });
    } catch (e: any) {
      setTestStatus({ ok: false, msg: e.message });
    }
  };

  // Fixed handleClearData missing error
  const handleClearData = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados locais? Esta ação não pode ser desfeita.')) {
      clearAllData();
      alert('Dados resetados com sucesso.');
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
          className="flex items-center gap-2 text-xs font-black bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200"
        >
          <Code size={16} /> Ver Código do Script
        </button>
      </div>

      <section className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <LinkIcon size={20} className="text-blue-600" />
          <h2>Conexão com Google Drive</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">URL da API (Deployment URL)</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={apiUrlInput}
              onChange={e => setApiUrlInput(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">ID da Pasta</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="ID alfanumérico da pasta"
              value={driveIdInput}
              onChange={e => setDriveIdInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={saveManualConfigs}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} /> Salvar Ajustes
            </button>
            <button 
              onClick={testConnection}
              disabled={testStatus.loading}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {testStatus.loading ? <RefreshCw className="animate-spin" size={20} /> : <Activity size={20} />} Testar Carga
            </button>
          </div>
        </div>

        {testStatus.msg && (
          <div className={`p-5 rounded-3xl border animate-in zoom-in duration-300 flex flex-col gap-2 ${testStatus.ok ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {testStatus.ok ? <ShieldCheck size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
              <span>{testStatus.ok ? 'Conexão OK' : 'Falha na Conexão'}</span>
            </div>
            <p className="text-xs whitespace-pre-line leading-relaxed">{testStatus.msg}</p>
            {!testStatus.ok && (
              <button onClick={() => setShowHelper(true)} className="text-[10px] font-black uppercase underline text-left mt-2 text-red-600">
                Como resolver este erro?
              </button>
            )}
          </div>
        )}
      </section>

      {/* MODAL AJUDA */}
      {showHelper && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-8 shadow-2xl relative">
            <button onClick={() => setShowHelper(false)} className="absolute top-6 right-6 text-gray-400"><X size={24} /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Guia Anti-Bloqueio</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</div>
                <div>
                  <p className="text-sm font-bold">Verifique o /exec</p>
                  <p className="text-xs text-gray-500">A URL colada deve terminar obrigatoriamente em <code>/exec</code>. Se terminar em <code>/edit</code>, não funcionará.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</div>
                <div>
                  <p className="text-sm font-bold">Quem tem acesso?</p>
                  <p className="text-xs text-gray-500">No Google Script, em Implantar > Gerenciar Implantações, mude para uma **Nova Versão** e garanta que em "Quem tem acesso" esteja escrito: **Qualquer pessoa (Anyone)**.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">3</div>
                <div>
                  <p className="text-sm font-bold">Cookies e Contas Google</p>
                  <p className="text-xs text-gray-500">Se você tem mais de um Gmail logado, o Google falha no redirecionamento. Use uma **Aba Anônima** ou deslogue das outras contas para testar.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowHelper(false)} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold">Vou verificar isso</button>
          </div>
        </div>
      )}

      {/* MODAL CÓDIGO */}
      {showCode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-[32px] flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Código do Script Atualizado</h2>
              <button onClick={() => setShowCode(false)} className="p-2 text-gray-400"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-mono text-[10px] leading-relaxed">
              <pre className="whitespace-pre-wrap">{scriptCode}</pre>
            </div>
            <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
              <button onClick={copyToClipboard} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'}`}>
                {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias</h2>
        </div>
        <div className="flex gap-2">
          <input type="text" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Comunhão" value={newCat} onChange={e => setNewCat(e.target.value)} />
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
        <p className="text-xs text-red-700">Isso apagará apenas os dados locais deste dispositivo.</p>
        <button onClick={handleClearData} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-700 transition-colors">Resetar App</button>
      </section>
    </div>
  );
};

export default Configuracoes;
