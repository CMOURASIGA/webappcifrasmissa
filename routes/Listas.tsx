
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit3, Calendar, Music, ArrowLeft, ChevronRight, List, Cloud, CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/stringUtils';

const Listas: React.FC = () => {
  const { listas, cifras, deleteLista, isSyncing, saveToDrive, config } = useApp();
  const [syncFeedback, setSyncFeedback] = useState<{show: boolean, success?: boolean}>({ show: false });

  const handleManualBackup = async () => {
    setSyncFeedback({ show: true });
    const success = await saveToDrive();
    setSyncFeedback({ show: true, success });
    setTimeout(() => setSyncFeedback({ show: false }), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">Minhas Listas</h1>
            {config.lastSync && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Último backup: {new Date(config.lastSync).toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleManualBackup}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
            title="Fazer backup manual para o Drive"
          >
            {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Cloud size={18} />}
            <span className="hidden sm:inline">Backup nuvem</span>
          </button>
          <Link 
            to="/listas/nova"
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-amber-200"
          >
            <Plus size={20} /> Nova Lista
          </Link>
        </div>
      </div>

      {syncFeedback.show && (
        <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300 ${
          syncFeedback.success === undefined ? 'bg-blue-50 border-blue-100 text-blue-600' :
          syncFeedback.success ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {syncFeedback.success === undefined ? <RefreshCw className="animate-spin" size={16} /> :
           syncFeedback.success ? <CheckCircle2 size={16} /> : <CloudOff size={16} />}
          <span className="text-sm font-bold">
            {syncFeedback.success === undefined ? 'Sincronizando listas...' :
             syncFeedback.success ? 'Listas salvas no Google Drive!' : 'Falha ao salvar no Drive.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        {listas.map(lista => {
          // Busca os títulos das músicas desta lista
          const musicasDaLista = lista.cifraIds
            .map(cid => cifras.find(c => c.id === cid))
            .filter(Boolean);
          
          const maxVisible = 4;
          const displayMusicas = musicasDaLista.slice(0, maxVisible);
          const remainingCount = musicasDaLista.length - maxVisible;

          return (
            <div key={lista.id} className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-1 min-w-0">
                  <Link to={`/listas/${lista.id}`} className="text-lg font-bold text-gray-900 hover:text-amber-600 transition-colors flex items-center gap-2 truncate">
                    {lista.nome}
                    <span title="Sincronizado">
                      <Cloud size={12} className="text-green-500 opacity-60" />
                    </span>
                  </Link>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {formatDate(lista.criadoEm)}</span>
                    <span className="flex items-center gap-1"><Music size={12}/> {lista.cifraIds.length} músicas</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Link 
                    to={`/listas/editar/${lista.id}`}
                    className="p-1.5 text-gray-300 hover:text-amber-500 transition-colors"
                    title="Editar lista"
                  >
                    <Edit3 size={18} />
                  </Link>
                  <button 
                    onClick={() => confirm('Excluir esta lista?') && deleteLista(lista.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    title="Excluir lista"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-3 mt-1">
                {lista.descricao && (
                  <p className="text-gray-500 text-xs italic line-clamp-1 border-l-2 border-gray-100 pl-2">{lista.descricao}</p>
                )}

                {/* VISUALIZAÇÃO DAS MÚSICAS NO CARD */}
                <div className="bg-gray-50/50 rounded-xl p-3 space-y-2 border border-gray-50">
                   <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Repertório:</h4>
                   <div className="space-y-1.5">
                     {displayMusicas.map((musica, idx) => (
                       <div key={musica?.id || idx} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                          <span className="truncate">{musica?.titulo || 'Música s/ Nome'}</span>
                          <span className="text-[9px] text-gray-400 font-bold ml-auto opacity-50">{musica?.tomBase}</span>
                       </div>
                     ))}
                     {remainingCount > 0 && (
                       <div className="text-[10px] text-amber-600 font-bold pl-3.5 pt-0.5">
                          + {remainingCount} músicas nesta lista...
                       </div>
                     )}
                     {musicasDaLista.length === 0 && (
                       <div className="text-xs text-gray-300 italic">Lista vazia</div>
                     )}
                   </div>
                </div>
              </div>

              <div className="mt-4">
                <Link 
                  to={`/listas/${lista.id}`}
                  className="w-full bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 py-3 rounded-xl font-bold text-center text-sm transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Modo Tocar <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}

        {listas.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-amber-300">
              <List size={40} />
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 font-bold text-lg">Nenhuma lista criada ainda</p>
              <p className="text-gray-500">Crie uma nova lista para organizar suas apresentações.</p>
            </div>
            <Link 
              to="/listas/nova"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-200"
            >
              Criar minha primeira lista
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listas;
