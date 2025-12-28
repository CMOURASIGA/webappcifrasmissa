
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, List as ListIcon, Maximize, Minimize } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CifraViewer from '../components/CifraViewer';
import TransposeControls from '../components/TransposeControls';

const VerLista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listas, cifras, config, updateConfig } = useApp();
  
  const lista = listas.find(l => l.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transposes, setTransposes] = useState<Record<string, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localFontSize, setLocalFontSize] = useState(config.chordFontSize || 14);

  // Refs para controle de gesto de pinça (pinch-to-zoom)
  const containerRef = useRef<HTMLDivElement>(null);
  const initialDist = useRef<number | null>(null);
  const initialFontSize = useRef<number>(localFontSize);

  const currentCifra = useMemo(() => {
    if (!lista) return null;
    const cid = lista.cifraIds[currentIndex];
    return cifras.find(c => c.id === cid);
  }, [lista, currentIndex, cifras]);

  // Sincroniza o tamanho da fonte local com o global quando mudar via pinch
  useEffect(() => {
    const timer = setTimeout(() => {
      updateConfig({ chordFontSize: localFontSize });
    }, 500);
    return () => clearTimeout(timer);
  }, [localFontSize]);

  // Lógica de Gesto de Pinça (Pinch to Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      initialDist.current = dist;
      initialFontSize.current = localFontSize;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      const delta = dist / initialDist.current;
      const newSize = Math.min(Math.max(Math.round(initialFontSize.current * delta), 8), 40);
      setLocalFontSize(newSize);
    }
  };

  const handleTouchEnd = () => {
    initialDist.current = null;
  };

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
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* HEADER COMPACTADO PARA MÁXIMO ESPAÇO */}
      <div className="sticky top-0 z-40 bg-slate-900 text-white shadow-2xl">
        <div className="max-w-6xl mx-auto px-1 py-1 flex items-center justify-between gap-1">
          
          {/* Navegação Rápida */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/listas')} 
              className="p-2 text-slate-500 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-2 rounded-lg ${currentIndex === 0 ? 'opacity-10' : 'bg-slate-800 active:scale-90'}`}
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Info da Música (Fonte Pequena para caber tudo) */}
          <div className="flex-1 min-w-0 text-center flex flex-col items-center">
            <h1 className="text-[11px] font-bold truncate w-full max-w-[150px] leading-tight text-amber-400">
              {currentCifra?.titulo || 'Sem título'}
            </h1>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                {currentIndex + 1}/{lista.cifraIds.length} • {lista.nome}
              </span>
            </div>
          </div>

          {/* Direita: Próxima + Menu */}
          <div className="flex items-center">
            <button 
              onClick={handleNext}
              disabled={currentIndex === lista.cifraIds.length - 1}
              className={`p-2 rounded-lg mr-1 ${currentIndex === lista.cifraIds.length - 1 ? 'opacity-10' : 'bg-amber-500 text-slate-900 active:scale-90'}`}
            >
              <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-white"
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>

        {/* Linha de Transposição - Ultra Slim */}
        <div className="bg-slate-800/50 py-1 flex justify-center border-t border-slate-800">
          <TransposeControls 
            amount={currentTranspose} 
            onChange={handleTransposeChange} 
            onReset={() => handleTransposeChange(0)} 
          />
          {/* Indicador visual de zoom para feedback do gesto */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 font-bold hidden md:block">
            {localFontSize}px
          </div>
        </div>
      </div>

      {/* ÁREA DA CIFRA - BORDA A BORDA COM PINCH ZOOM */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-full max-w-[100vw]">
          {currentCifra ? (
            <CifraViewer 
              conteudo={currentCifra.conteudo} 
              transposeAmount={currentTranspose} 
              fontSize={localFontSize} 
            />
          ) : (
            <div className="p-10 text-center text-gray-400 text-sm">
              Selecione uma música da lista.
            </div>
          )}
        </div>
      </div>

      {/* Selector Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
           <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                <h2 className="font-bold text-sm text-gray-900 uppercase tracking-widest">Roteiro</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400"><ChevronRight size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {lista.cifraIds.map((cid, idx) => {
                  const c = cifras.find(x => x.id === cid);
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={cid + idx}
                      onClick={() => { setCurrentIndex(idx); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        isActive ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xs font-black opacity-50">{idx + 1}</span>
                      <span className="font-bold text-sm truncate">{c?.titulo || 'Sem nome'}</span>
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
