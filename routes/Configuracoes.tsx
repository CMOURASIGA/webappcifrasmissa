
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Tag, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Configuracoes: React.FC = () => {
  const { categorias, addCategoria, deleteCategoria } = useApp();
  const [newCat, setNewCat] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    addCategoria(newCat.trim());
    setNewCat('');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Tag size={20} className="text-blue-500" />
          <h2>Categorias Litúrgicas</h2>
        </div>
        <p className="text-gray-500 text-sm">Gerencie os momentos da missa para organizar suas cifras.</p>
        
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nova categoria (ex: Salmo)"
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAdd()}
          />
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="font-medium text-gray-700">{cat.nome}</span>
              <button 
                onClick={() => confirm(`Excluir categoria "${cat.nome}"?`) && deleteCategoria(cat.id)}
                className="p-1.5 text-gray-300 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-2">
          <Layout size={20} className="text-amber-500" />
          <h2>Preferências de Exibição</h2>
        </div>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex flex-col items-center justify-center text-center space-y-2">
           <p className="text-amber-800 font-bold">Tema Escuro e Fontes</p>
           <p className="text-amber-700 text-sm">Estas funcionalidades estarão disponíveis em breve. No momento, o sistema utiliza o tema claro padrão.</p>
        </div>
      </section>

      <div className="text-center pt-8 border-t border-gray-100">
         <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cifras MISSA v1.0.0</p>
         <p className="text-xs text-gray-300 mt-1">Feito para servir à liturgia.</p>
      </div>
    </div>
  );
};

export default Configuracoes;
