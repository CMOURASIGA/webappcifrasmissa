
import React from 'react';
import { Link } from 'react-router-dom';
// Added List to the imported components from lucide-react
import { Plus, Trash2, Calendar, Music, ArrowLeft, ChevronRight, Clock, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/stringUtils';

const Listas: React.FC = () => {
  const { listas, deleteLista } = useApp();

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Listas</h1>
        </div>
        <Link 
          to="/listas/nova"
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-amber-200"
        >
          <Plus size={20} /> Nova Lista
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listas.map(lista => (
          <div key={lista.id} className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <Link to={`/listas/${lista.id}`} className="text-xl font-bold text-gray-900 hover:text-amber-600 transition-colors">
                  {lista.nome}
                </Link>
                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(lista.criadoEm)}</span>
                  <span className="flex items-center gap-1"><Music size={14}/> {lista.cifraIds.length} músicas</span>
                </div>
              </div>
              <button 
                onClick={() => confirm('Excluir esta lista?') && deleteLista(lista.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            {lista.descricao && (
              <p className="text-gray-500 text-sm line-clamp-2 mb-6">{lista.descricao}</p>
            )}

            <div className="flex gap-2">
              <Link 
                to={`/listas/${lista.id}`}
                className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 py-3 rounded-xl font-bold text-center text-sm transition-colors flex items-center justify-center gap-2"
              >
                Modo Tocar <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}

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
