import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Type, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CifraViewer from '../components/CifraViewer';
import TransposeControls from '../components/TransposeControls';

const VerCifra: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cifras, updateCifra, categorias } = useApp();
  const cifra = cifras.find(c => c.id === id);
  
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Estado para o formulário de edição
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    tomBase: 'C',
    conteudo: '',
    selectedCategorias: [] as string[]
  });

  // Inicializar formulário quando abrir modal ou cifra carregar
  useEffect(() => {
    if (cifra) {
      setEditFormData({
        titulo: cifra.titulo,
        tomBase: cifra.tomBase,
        conteudo: cifra.conteudo,
        selectedCategorias: cifra.categorias || []
      });
    }
  }, [cifra, isEditModalOpen]);

  if (!cifra) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-gray-500">Música não encontrada.</p>
        <button onClick={() => navigate('/biblioteca')} className="text-blue-600 font-bold hover:underline">
          Voltar para Biblioteca
        </button>
      </div>
    );
  }

  const handleUpdate = () => {
    if (!editFormData.titulo || !editFormData.conteudo) return;
    updateCifra(cifra.id, {
      titulo: editFormData.titulo,
      tomBase: editFormData.tomBase,
      conteudo: editFormData.conteudo,
      categorias: editFormData.selectedCategorias
    });
    setIsEditModalOpen(false);
  };

  const toggleCategory = (id: string) => {
    setEditFormData(prev => ({
      ...prev,
      selectedCategorias: prev.selectedCategorias.includes(id)
        ? prev.selectedCategorias.filter(x => x !== id)
        : [...prev.selectedCategorias, id]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-none">{cifra.titulo}</h1>
              <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">Tom Original: {cifra.tomBase}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-center md:self-auto">
             <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => setFontSize(s => Math.max(10, s - 2))} className="p-1.5 hover:bg-white rounded text-gray-500"><ZoomOut size={18}/></button>
                <div className="px-2 text-xs font-bold text-gray-500"><Type size={14}/></div>
                <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="p-1.5 hover:bg-white rounded text-gray-500"><ZoomIn size={18}/></button>
             </div>
             <TransposeControls 
               amount={transpose} 
               onChange={setTranspose} 
               onReset={() => setTranspose(0)} 
             />
             <button 
               onClick={() => setIsEditModalOpen(true)}
               className="md:hidden p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
               title="Editar Cifra"
             >
               <Edit3 size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 mt-4">
        <CifraViewer 
          conteudo={cifra.conteudo} 
          transposeAmount={transpose} 
          fontSize={fontSize} 
        />
      </div>

      <div className="fixed bottom-6 right-6 hidden md:block">
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="bg-white border border-gray-200 p-4 rounded-full shadow-lg text-gray-700 hover:text-blue-600 transition-all hover:scale-105 active:scale-95"
        >
           <Edit3 size={24} />
        </button>
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Editar Cifra</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
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
                    value={editFormData.titulo}
                    onChange={e => setEditFormData({...editFormData, titulo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Tom</label>
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.tomBase}
                    onChange={e => setEditFormData({...editFormData, tomBase: e.target.value})}
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
                  value={editFormData.conteudo}
                  onChange={e => setEditFormData({...editFormData, conteudo: e.target.value})}
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
                        editFormData.selectedCategorias.includes(cat.id)
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
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdate}
                disabled={!editFormData.titulo || !editFormData.conteudo}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerCifra;