
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, List, Settings, HelpCircle, ChevronRight, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Home: React.FC = () => {
  const { cifras, listas } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Bem-vindo ao Cifras MISSA
        </h1>
        <p className="text-gray-600 text-lg">Organize seu ministério de música com facilidade.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/biblioteca" 
          className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-start gap-4 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Book size={120} />
          </div>
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
            <Book size={28} />
          </div>
          <div className="space-y-1 z-10">
            <h2 className="text-xl font-bold text-gray-900">Biblioteca de Cifras</h2>
            <p className="text-gray-500 text-sm">Gerencie suas músicas, adicione novas e visualize tons.</p>
            <p className="text-blue-600 text-xs font-bold pt-2 flex items-center gap-1">
              {cifras.length} músicas cadastradas <ChevronRight size={14} />
            </p>
          </div>
        </Link>

        <Link 
          to="/listas" 
          className="group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-start gap-4 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <List size={120} />
          </div>
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
            <List size={28} />
          </div>
          <div className="space-y-1 z-10">
            <h2 className="text-xl font-bold text-gray-900">Minhas Listas</h2>
            <p className="text-gray-500 text-sm">Monte repertórios para missas, ensaios e eventos.</p>
            <p className="text-amber-600 text-xs font-bold pt-2 flex items-center gap-1">
              {listas.length} listas criadas <ChevronRight size={14} />
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4">
        <h3 className="text-blue-800 font-bold flex items-center gap-2">
          <HelpCircle size={20} /> Dica de Uso Rápido
        </h3>
        <p className="text-blue-700 text-sm leading-relaxed">
          Você pode criar uma lista selecionando músicas da sua biblioteca. Na hora da missa, basta abrir a lista e navegar entre as músicas usando os botões "Próxima" e "Anterior". Tudo fica salvo localmente no seu navegador.
        </p>
        <Link 
          to="/como-usar" 
          className="inline-flex items-center gap-2 text-blue-800 font-bold text-sm hover:underline"
        >
          Ver tutorial completo <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/configuracoes" className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors">
          <Settings size={18} /> Configurações
        </Link>
        <Link to="/como-usar" className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors">
          <HelpCircle size={18} /> Tutorial
        </Link>
      </div>
    </div>
  );
};

export default Home;
