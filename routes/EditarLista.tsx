
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle2, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { normalizeText } from '../utils/stringUtils';

const EditarLista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cifras, listas, updateLista } = useApp();
  
  const listaOriginal = listas.find(l => l.id === id);

  const [search, setSearch] = useState('');
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (listaOriginal) {
      setNome(listaOriginal.nome);
      setDescricao(listaOriginal.descricao || '');
      setSelectedIds(listaOriginal.cifraIds);
    }
  }, [listaOriginal]);

  const filteredCifras = useMemo(() => {
    const term = normalizeText(search);
    return cifras.filter(c => normalizeText(c.titulo).includes(term));
  }, [cifras, search]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!nome || !id) return;
    updateLista(id, {
      nome,
      descricao,
      cifraIds: selectedIds
    });
    navigate('/listas');
  };

  if (!listaOriginal) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-gray-500">Lista não encontrada.</p>
        <Link to="/listas" className="text-amber-600 font-bold hover:underline">Voltar para Listas</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 pb-32">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar Lista</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome da Lista</label>
          <input 
            type="text"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-lg font-semibold"
            placeholder="Ex: Missa de Domingo"
            value={nome}
            onChange={e => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Descrição</label>
          <textarea 
            className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
            rows={2}
            placeholder="Observações..."
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Músicas na Lista <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{selectedIds.length}</span>
          </h2>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Buscar para adicionar..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:bg-white border border-transparent focus:border-gray-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredCifras.map(cifra => {
            const isSelected = selectedIds.includes(cifra.id);
            return (
              <button
                key={cifra.id}
                onClick={() => toggleSelection(cifra.id)}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                  isSelected 
                    ? 'bg-amber-50 border-amber-300 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-300'
                }`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold truncate ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}>
                    {cifra.titulo}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{cifra.tomBase}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 flex gap-4">
        <button 
          onClick={() => navigate('/listas')}
          className="flex-1 bg-white border border-gray-200 text-gray-500 py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSave}
          disabled={!nome || selectedIds.length === 0}
          className="flex-1 bg-amber-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} /> Salvar Lista
        </button>
      </div>
    </div>
  );
};

export default EditarLista;
