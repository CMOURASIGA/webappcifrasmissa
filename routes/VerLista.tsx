
import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, List as ListIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CifraViewer from '../components/CifraViewer';
import TransposeControls from '../components/TransposeControls';

const VerLista: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listas, cifras, config } = useApp();
  
  const lista = listas.find(l => l.id === id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transposes, setTransposes] = useState<Record<string, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fontSize = config.chordFontSize || 14;

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER ULTRA COMPACTO E FUNCIONAL */}
      <div className="sticky top-16 z-40 bg-slate-900 text-white px-2 py-2 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          {/* Esquerda: Voltar + Navegação Anterior */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => navigate('/listas')} 
              className="p-2 hover:bg-white/10 rounded-full text-slate-400"
              title="Sair do modo tocar"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-2 rounded-xl transition-all ${currentIndex === 0 ? 'text-white/10' : 'bg-white/10 text-white active:scale-90'}`}
            >
              <ChevronLeft size={24} />
            </button>
          </div>

          {/* Centro: Info da Música */}
          <div className="flex-1 min-w-0 text-center px-1">
            <h1 className="text-xs font-bold truncate leading-tight">
              {currentCifra?.titulo || 'Sem título'}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-black bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-sm">
                {currentIndex + 1} / {lista.cifraIds.length}
              </span>
              <span className="text-[9px] text-slate-400 font-bold truncate max-w-[80px]">
                {lista.nome}
              </span>
            </div>
          </div>

          {/* Direita: Próxima + Menu */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handleNext}
              disabled={currentIndex === lista.cifraIds.length - 1}
              className={`p-2 rounded-xl transition-all ${currentIndex === lista.cifraIds.length - 1 ? 'text-white/10' : 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 active:scale-90'}`}
            >
              <ChevronRight size={24} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <ListIcon size={22} />
            </button>
          </div>
        </div>

        {/* Linha Inferior do Header: Apenas Transposição */}
        <div className="max-w-6xl mx-auto flex justify-center mt-2 pb-1">
          <TransposeControls 
            amount={currentTranspose} 
            onChange={handleTransposeChange} 
            onReset={() => handleTransposeChange(0)} 
          />
        </div>
      </div>

      {/* ÁREA DA CIFRA - AGORA COM MAIS ESPAÇO */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-1 md:p-6 pb-10">
        {currentCifra ? (
          <CifraViewer 
            conteudo={currentCifra.conteudo} 
            transposeAmount={currentTranspose} 
            fontSize={fontSize} 
          />
        ) : (
          <div className="bg-white p-12 rounded-xl text-center text-gray-400">
            Música não encontrada na biblioteca.
          </div>
        )}
      </div>

      {/* Selector Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
           <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">Roteiro da Lista</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lista.nome}</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400">
                  <ChevronRight size={24} />
                </button>
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
                          ? 'bg-amber-50 border-amber-300 shadow-sm' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        isActive ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${isActive ? 'text-amber-900' : 'text-gray-700'}`}>
                          {c?.titulo || 'Música s/ Nome'}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{c?.tomBase}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <Link to={`/listas/editar/${lista.id}`} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                  Editar Ordem das Músicas
                </Link>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VerLista;
