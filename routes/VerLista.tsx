
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, List as ListIcon, Type, ZoomIn, ZoomOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CifraViewer from '../components/CifraViewer';
import TransposeControls from '../components/TransposeControls';

const VerLista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listas, cifras } = useApp();
  
  const lista = listas.find(l => l.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transposes, setTransposes] = useState<Record<string, number>>({});
  const [fontSize, setFontSize] = useState(16);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentCifra = useMemo(() => {
    if (!lista) return null;
    const cid = lista.cifraIds[currentIndex];
    return cifras.find(c => c.id === cid);
  }, [lista, currentIndex, cifras]);

  if (!lista || lista.cifraIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
        <p className="text-gray-500">Lista não encontrada ou vazia.</p>
        <Link to="/listas" className="text-amber-600 font-bold">Voltar para Listas</Link>
      </div>
    );
  }

  const currentTranspose = transposes[currentCifra?.id || ''] || 0;
  
  const handleTransposeChange = (newAmount: number) => {
    if (!currentCifra) return;
    setTransposes(prev => ({ ...prev, [currentCifra.id]: newAmount }));
  };

  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentIndex(prev => Math.min(lista.cifraIds.length - 1, prev + 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Dynamic Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/listas" className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-amber-600 uppercase tracking-tight truncate">{lista.nome}</h1>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-extrabold text-gray-900 truncate">
                   {currentCifra?.titulo || 'Música não encontrada'}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                   {currentIndex + 1} de {lista.cifraIds.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-center md:self-auto">
             <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => setFontSize(s => Math.max(10, s - 2))} className="p-1.5 hover:bg-white rounded text-gray-500"><ZoomOut size={16}/></button>
                <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="p-1.5 hover:bg-white rounded text-gray-500"><ZoomIn size={16}/></button>
             </div>
             <TransposeControls 
               amount={currentTranspose} 
               onChange={handleTransposeChange} 
               onReset={() => handleTransposeChange(0)} 
             />
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                title="Ver ordem da lista"
             >
               <ListIcon size={20} />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 pb-24">
        {currentCifra ? (
          <CifraViewer 
            conteudo={currentCifra.conteudo} 
            transposeAmount={currentTranspose} 
            fontSize={fontSize} 
          />
        ) : (
          <div className="bg-white p-12 rounded-xl text-center text-gray-400">
            Música ID "{lista.cifraIds[currentIndex]}" não disponível.
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 disabled:opacity-30 rounded-2xl font-bold text-gray-700 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} /> Anterior
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === lista.cifraIds.length - 1}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-amber-500 disabled:opacity-30 text-white rounded-2xl font-bold shadow-lg shadow-amber-200 active:scale-95 transition-all"
          >
            Próxima <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Selector Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)}></div>
           <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-lg text-gray-900">Ordem da Lista</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="rotate-180" size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {lista.cifraIds.map((cid, idx) => {
                  const c = cifras.find(x => x.id === cid);
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={cid + idx}
                      onClick={() => { setCurrentIndex(idx); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left border transition-all ${
                        isActive 
                          ? 'bg-amber-50 border-amber-200 shadow-sm' 
                          : 'bg-white border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`font-bold truncate ${isActive ? 'text-amber-900' : 'text-gray-700'}`}>
                        {c?.titulo || 'Música s/ Nome'}
                      </span>
                    </button>
                  );
                })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VerLista;
