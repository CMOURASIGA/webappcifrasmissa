
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, RefreshCw, Cloud, X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizeText } from '../utils/stringUtils';

const Biblioteca: React.FC = () => {
  const { cifras, deleteCifra, addCifra, categorias, syncFromDrive, isSyncing, syncStatus } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    show: boolean, 
    success?: boolean, 
    msg: string,
    stats?: { new: number, updated: number, kept: number }
  }>({ show: false, msg: '' });
  
  const [newSong, setNewSong] = useState({
    titulo: '',
    tomBase: 'C',
    conteudo: '',
    selectedCategorias: [] as string[]
  });

  useEffect(() => {
    if (syncResult.show && syncResult.success) {
      const timer = setTimeout(() => setSyncResult(prev => ({ ...prev, show: false })), 10000);
      return () => clearTimeout(timer);
    }
  }, [syncResult.show, syncResult.success]);

  const filteredCifras = useMemo(() => {
    const term = normalizeText(search);
    return cifras.filter(c => 
      normalizeText(c.titulo).includes(term)
    );
  }, [cifras, search]);

  const handleSync = async () => {
    setSyncResult({ show: false, msg: '' });
    const result = await syncFromDrive();
    if (result.success) {
      setSyncResult({ 
        show: true, 
        success: true, 
        msg: `Processamento inteligente finalizado.`,
        stats: {
          new: result.newCount || 0,
          updated: result.updatedCount || 0,
          kept: result.keptCount || 0
        }
      });
    } else {
      setSyncResult({ show: true, success: false, msg: result.error || 'Erro na sincronização.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all border shadow-sm ${
              isSyncing ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Drive'}</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-200"
          >
            <Plus size={20} /> Nova Cifra
          </button>
        </div>
      </div>

      {/* Status de Sincronização em Tempo Real */}
      {isSyncing && (
        <div className="bg-blue-600 rounded-2xl p-4 text-white flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg shadow-blue-100">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin" />
                <span className="font-bold text-sm tracking-wide uppercase">{syncStatus}</span>
              </div>
              <span className="text-[10px] font-bold opacity-70">Aguarde, processando arquivos...</span>
           </div>
           <div className="w-full bg-blue-400/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full animate-pulse transition-all duration-1000" style={{ width: '60%' }}></div>
           </div>
        </div>
      )}

      {syncResult.show && (
        <div className={`p-4 rounded-2xl border animate-in slide-in-from-top duration-300 relative ${
          syncResult.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {syncResult.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm block">{syncResult.msg}</span>
              {syncResult.stats && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-medium">Novas: <strong>{syncResult.stats.new}</strong></span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-xs font-medium">Atualizadas: <strong>{syncResult.stats.updated}</strong></span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium">Mantidas: <strong>{syncResult.stats.kept}</strong></span>
                   </div>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSyncResult(prev => ({ ...prev, show: false }))}
              className="p-1 hover:bg-black/5 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar na sua biblioteca local..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
        {filteredCifras.map(cifra => (
          <div key={cifra.id} className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
            <Link to={`/cifra/${cifra.id}`} className="block space-y-3">
              <div className="flex justify-between items-start">
                <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded tracking-tighter uppercase">
                  Tom: {cifra.tomBase}
                </span>
                <div className="flex items-center gap-2">
                   {cifra.driveId && <Cloud size={14} className="text-green-500 opacity-50" />}
                   <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if(confirm('Excluir esta cifra localmente?')) deleteCifra(cifra.id);
                    }}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                   >
                    <Trash2 size={16} />
                   </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 truncate">
                {cifra.titulo}
              </h3>
              <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                {cifra.categorias.map(catId => {
                  const cat = categorias.find(x => x.id === catId);
                  return cat ? <span key={catId} className="text-[9px] font-bold bg-gray-50 text-gray-400 border border-gray-100 px-2 py-0.5 rounded uppercase">{cat.nome}</span> : null;
                })}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Modal de Nova Cifra permanece o mesmo... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nova Cifra Manual</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Santo Espírito"
                    value={newSong.titulo}
                    onChange={e => setNewSong({...newSong, titulo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tom Base</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSong.tomBase}
                    onChange={e => setNewSong({...newSong, tomBase: e.target.value})}
                  >
                    {['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cifra</label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
                  rows={10}
                  placeholder="Cole aqui a letra e os acordes..."
                  value={newSong.conteudo}
                  onChange={e => setNewSong({...newSong, conteudo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Categorias</label>
                <div className="flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewSong(prev => ({
                        ...prev,
                        selectedCategorias: prev.selectedCategorias.includes(cat.id)
                          ? prev.selectedCategorias.filter(x => x !== cat.id)
                          : [...prev.selectedCategorias, cat.id]
                      }))}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                        newSong.selectedCategorias.includes(cat.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                      }`}
                    >
                      {cat.nome}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (!newSong.titulo || !newSong.conteudo) return;
                  addCifra({ ...newSong, tags: [], categorias: newSong.selectedCategorias });
                  setNewSong({ titulo: '', tomBase: 'C', conteudo: '', selectedCategorias: [] });
                  setIsModalOpen(false);
                }}
                disabled={!newSong.titulo || !newSong.conteudo}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                Salvar Cifra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Biblioteca;
