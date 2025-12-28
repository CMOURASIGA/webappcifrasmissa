
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizeText } from '../utils/stringUtils';

const Biblioteca: React.FC = () => {
  const { cifras, deleteCifra, addCifra, categorias } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Song Form State
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

  const toggleCategoria = (id: string) => {
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
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Cifras</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-200"
        >
          <Plus size={20} /> Adicionar Nova
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar por título ou tag..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCifras.map(cifra => (
          <div key={cifra.id} className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative">
            <Link to={`/cifra/${cifra.id}`} className="block space-y-3">
              <div className="flex justify-between items-start">
                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">
                  {cifra.tomBase}
                </span>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if(confirm('Excluir esta cifra permanentemente?')) deleteCifra(cifra.id);
                  }}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                {cifra.titulo}
              </h3>
              <div className="flex flex-wrap gap-1">
                {cifra.categorias.map(catId => {
                  const cat = categorias.find(x => x.id === catId);
                  return cat ? (
                    <span key={catId} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {cat.nome}
                    </span>
                  ) : null;
                })}
              </div>
            </Link>
          </div>
        ))}
        {filteredCifras.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-3">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search size={32} />
            </div>
            <p className="text-gray-500 font-medium">Nenhuma música encontrada para sua busca.</p>
          </div>
        )}
      </div>

      {/* Modal Nova Cifra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nova Cifra</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Título</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    placeholder="Ex: Vou Te Oferecer"
                    value={newSong.titulo}
                    onChange={e => setNewSong(s => ({...s, titulo: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tom Base</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                    value={newSong.tomBase}
                    onChange={e => setNewSong(s => ({...s, tomBase: e.target.value}))}
                  >
                    {['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Conteúdo da Cifra</label>
                <textarea 
                  className="w-full h-64 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-mono text-sm leading-relaxed"
                  placeholder="Cole aqui a cifra com acordes acima das letras..."
                  value={newSong.conteudo}
                  onChange={e => setNewSong(s => ({...s, conteudo: e.target.value}))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categorias Litúrgicas</label>
                <div className="flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoria(cat.id)}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                        newSong.selectedCategorias.includes(cat.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
                className="flex-1 px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddSong}
                disabled={!newSong.titulo || !newSong.conteudo}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
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
