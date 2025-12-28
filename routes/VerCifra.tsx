
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, ZoomIn, ZoomOut, Maximize2, Minimize2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CifraViewer from '../components/CifraViewer';
import TransposeControls from '../components/TransposeControls';

const VerCifra: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cifras, updateCifra, categorias, config, updateConfig } = useApp();
  const cifra = cifras.find(c => c.id === id);
  
  const [transpose, setTranspose] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const fontSize = config.chordFontSize || 14;

  const handleZoom = (val: number) => {
    updateConfig({ chordFontSize: val });
  };

  const [editFormData, setEditFormData] = useState({
    titulo: '',
    tomBase: 'C',
    conteudo: '',
    selectedCategorias: [] as string[]
  });

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

  const toggleCategory = (catId: string) => {
    setEditFormData(prev => ({
      ...prev,
      selectedCategorias: prev.selectedCategorias.includes(catId)
        ? prev.selectedCategorias.filter(x => x !== catId)
        : [...prev.selectedCategorias, catId]
    }));
  };

  return (
    <div className={`min-h-screen bg-white transition-all ${isFullscreen ? 'fixed inset-0 z-[100] overflow-y-auto' : 'pb-20'}`}>
      {/* CABEÇALHO COMPACTO */}
      {!isFullscreen && (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-2 py-1.5 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 leading-tight truncate">{cifra.titulo}</h1>
                <p className="text-[10px] text-blue-600 font-black uppercase">Tom: {cifra.tomBase}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsFullscreen(true)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
                title="Modo Leitura Cheia"
              >
                <Maximize2 size={20} />
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"
              >
                <Edit3 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTROLES FLUTUANTES (Aparecem no scroll ou tela cheia) */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex flex-col gap-3 min-w-[280px]">
          
          <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-2 flex-1">
                <ZoomOut size={14} className="text-slate-400" />
                <input 
                  type="range" 
                  min="8" 
                  max="32" 
                  step="1"
                  value={fontSize}
                  onChange={(e) => handleZoom(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <ZoomIn size={14} className="text-slate-400" />
                <span className="text-[10px] font-mono font-bold w-6 text-center">{fontSize}</span>
             </div>
             
             {isFullscreen && (
               <button onClick={() => setIsFullscreen(false)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
                 <Minimize2 size={18} />
               </button>
             )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2">
            <TransposeControls 
               amount={transpose} 
               onChange={setTranspose} 
               onReset={() => setTranspose(0)} 
            />
            <button 
              onClick={() => setShowControls(false)}
              className="p-1.5 text-slate-500 hover:text-white"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>

      {!showControls && (
        <button 
          onClick={() => setShowControls(true)}
          className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg animate-bounce"
        >
          <ChevronUp size={24} />
        </button>
      )}

      <div className={`max-w-5xl mx-auto p-1 md:p-4 ${isFullscreen ? 'pt-4' : ''}`}>
        <CifraViewer 
          conteudo={cifra.conteudo} 
          transposeAmount={transpose} 
          fontSize={fontSize} 
        />
      </div>

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
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
