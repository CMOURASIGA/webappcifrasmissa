import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, RefreshCw, Cloud, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizeText } from '../utils/stringUtils';

const Biblioteca: React.FC = () => {
  const { cifras, deleteCifra, addCifra, categorias, syncFromDrive, isSyncing } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newSong, setNewSong] = useState({
    titulo: '',
    tomBase: 'C',
    conteudo: '',
    selectedCategorias: [] as string[]
  });

  const filteredCifras = useMemo(() => {
    const term = normalizeText(search);
    return cifras.filter(c => 
      normalizeText(c.titulo).includes(term) || 
      c.tags.some(t => normalizeText(t).includes(term))
    );
  }, [cifras, search]);

  const handleAddSong = () => {
    if (!newSong.titulo || !newSong.conteudo) return;
    addCifra({
      titulo: newSong.titulo,
      tomBase: newSong.tomBase,
      conteudo: newSong.conteudo,
      categorias: newSong.selectedCategorias,
      tags: []
    });
    setNewSong({ titulo: '', tomBase: 'C', conteudo: '', selectedCategorias: [] });
    setIsModalOpen(false);
  };

  const toggleCategory = (id: string) => {
    setNewSong(prev => ({
      ...prev,
      selectedCategorias: prev.selectedCategorias.includes(id)
        ? prev.selectedCategorias.filter(x => x !== id)
        : [...prev.selectedCategorias, id]
    }));
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
            onClick={syncFromDrive}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
            title="Sincronizar com Drive"
          >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-200"
          >
            <Plus size={20} /> Nova Cifra
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar música..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCifras.map(cifra => (
          <div key={cifra.id} className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
            <Link to={`/cifra/${cifra.id}`} className="block space-y-3">
              <div className="flex justify-between items-start">
                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">
                  {cifra.tomBase}
                </span>
                <div className="flex items-center gap-2">
                   {cifra.driveId && (
                     <span title="Sincronizado com Drive">
                       <Cloud size={14} className="text-green-500" />
                     </span>
                   )}
                   <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if(confirm('Excluir esta cifra?')) deleteCifra(cifra.id);
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
              <div className="flex flex-wrap gap-1">
                {cifra.categorias.map(catId => {
                  const cat = categorias.find(x => x.id === catId);
                  return cat ? <span key={catId} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{cat.nome}</span> : null;
                })}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nova Cifra</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Título da Música</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Hino de Louvor"
                    value={newSong.titulo}
                    onChange={e => setNewSong({...newSong, titulo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tom</label>
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
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cifra (Acordes e Letra)</label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
                  rows={10}
                  placeholder="G       D/F#     Em&#10;Pai nosso que estais no céu..."
                  value={newSong.conteudo}
                  onChange={e => setNewSong({...newSong, conteudo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categorias Litúrgicas</label>
                <div className="flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        newSong.selectedCategorias.includes(cat.id)
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
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
                onClick={handleAddSong}
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