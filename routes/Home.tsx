
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, List, Settings, HelpCircle, ChevronRight, Music, Cloud, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { googleDriveService } from '../services/googleDriveService';

const Home: React.FC = () => {
  const { cifras, listas, effectiveFolderId } = useApp();
  
  const hasDriveConfig = !!effectiveFolderId;
  const hasApiConfig = googleDriveService.isApiConfigured();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Cifras MISSA
        </h1>
        <p className="text-gray-600 text-lg">Seu ministério de música conectado e organizado.</p>
      </section>

      {/* Alerta de API Faltante (Vercel) */}
      {!hasApiConfig && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <LinkIcon size={32} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-red-900 font-bold text-lg">API do Google não encontrada</h3>
            <p className="text-red-700 text-sm">A variável de ambiente <strong>GOOGLE_API</strong> não foi detectada. Verifique as configurações no painel do Vercel.</p>
          </div>
        </div>
      )}

      {/* Alerta de Pasta Faltante */}
      {hasApiConfig && !hasDriveConfig && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 animate-pulse">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600">
            <AlertTriangle size={32} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-amber-900 font-bold text-lg">Pasta não configurada</h3>
            <p className="text-amber-700 text-sm">A API está pronta, mas você precisa definir o ID da sua pasta de cifras para começar.</p>
            <Link 
              to="/configuracoes" 
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-amber-700 transition-colors"
            >
              Ir para Ajustes agora <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {hasDriveConfig && hasApiConfig && cifras.length === 0 && (
        <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Cloud size={32} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-blue-900 font-bold text-lg">Pronto para Sincronizar</h3>
            <p className="text-blue-700 text-sm">Sua pasta está conectada! Vá para a biblioteca para baixar suas cifras pela primeira vez.</p>
            <Link 
              to="/biblioteca" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-colors"
            >
              Ir para Biblioteca <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

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
            <p className="text-gray-500 text-sm">Sincronize arquivos do Drive e gerencie seus tons.</p>
            <p className="text-blue-600 text-xs font-bold pt-2 flex items-center gap-1">
              {cifras.length} músicas carregadas <ChevronRight size={14} />
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
            <p className="text-gray-500 text-sm">Monte repertórios para missas e ensaios.</p>
            <p className="text-amber-600 text-xs font-bold pt-2 flex items-center gap-1">
              {listas.length} listas criadas <ChevronRight size={14} />
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-white">
        <h3 className="text-blue-400 font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
          <ChevronRight size={16} /> Fluxo Recomendado para o Sucesso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className={`space-y-2 p-4 rounded-2xl border ${!hasDriveConfig || !hasApiConfig ? 'bg-blue-600 border-blue-500' : 'bg-slate-800/50 border-slate-700'}`}>
              <span className="text-[10px] font-black opacity-50 uppercase">Passo 1</span>
              <p className="text-sm font-bold">Configure a API e o ID da Pasta nos <strong>Ajustes</strong>.</p>
           </div>
           <div className={`space-y-2 p-4 rounded-2xl border ${hasDriveConfig && hasApiConfig && cifras.length === 0 ? 'bg-blue-600 border-blue-500' : 'bg-slate-800/50 border-slate-700 opacity-80'}`}>
              <span className="text-[10px] font-black opacity-50 uppercase">Passo 2</span>
              <p className="text-sm font-bold">Vá na <strong>Biblioteca</strong> e clique em Sincronizar.</p>
           </div>
           <div className={`space-y-2 p-4 rounded-2xl border ${cifras.length > 0 ? 'bg-blue-600 border-blue-500' : 'bg-slate-800/50 border-slate-700 opacity-80'}`}>
              <span className="text-[10px] font-black opacity-50 uppercase">Passo 3</span>
              <p className="text-sm font-bold">Crie suas <strong>Listas</strong> e toque com transposição.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/configuracoes" className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors">
          <Settings size={18} /> Ajustes
        </Link>
        <Link to="/como-usar" className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors">
          <HelpCircle size={18} /> Como Usar
        </Link>
      </div>
    </div>
  );
};

export default Home;
