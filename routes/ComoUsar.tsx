
import React from 'react';
import { ArrowLeft, Book, List, RefreshCw, CheckCircle2, Settings, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComoUsar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-12 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900">Guia de Configuração</h1>
      </div>

      <section className="space-y-4 relative">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Settings size={24} />
        </div>
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-100 -z-10 hidden md:block"></div>
        <h2 className="text-2xl font-bold text-gray-900">1. Primeiro Passo: Configurar o Drive</h2>
        <p className="text-gray-600 leading-relaxed">
          Para que suas músicas apareçam automaticamente, você precisa conectar sua pasta do Google Drive. 
          Vá em <strong>Ajustes (Configurações)</strong> e cole o <strong>ID da sua pasta</strong> (aquele código que fica no final do link da pasta no navegador). 
          Clique em <strong>Testar Carga</strong> para garantir que a conexão está ativa.
        </p>
        <button 
           onClick={() => navigate('/configuracoes')}
           className="inline-flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition-colors"
        >
          Ir para Configurações agora <Settings size={16} />
        </button>
      </section>

      <section className="space-y-4">
        <div className="bg-emerald-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <RefreshCw size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">2. Sincronizar Biblioteca</h2>
        <p className="text-gray-600 leading-relaxed">
          Com a pasta configurada, vá em <strong>Biblioteca</strong> e clique no botão <strong>Sincronizar</strong>. 
          O sistema lerá todos os arquivos de texto (.txt) da sua pasta e os transformará em cifras interativas. 
          <em>Dica: O sistema identifica mudanças nos arquivos e atualiza apenas o que for necessário.</em>
        </p>
      </section>

      <section className="space-y-4">
        <div className="bg-amber-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <List size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">3. Organizar Listas (Setlists)</h2>
        <p className="text-gray-600 leading-relaxed">
          Na aba <strong>Minhas Listas</strong>, você monta o repertório da celebração. 
          Escolha as músicas da biblioteca na ordem desejada. Isso cria um fluxo de navegação rápida entre as cifras durante a missa.
        </p>
      </section>

      <section className="space-y-4">
        <div className="bg-slate-800 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">4. Transposição e Performance</h2>
        <p className="text-gray-600 leading-relaxed">
          Ao abrir uma música, use os botões <strong>+</strong> e <strong>-</strong> para mudar o tom instantaneamente. 
          No <strong>Modo Tocar</strong> das listas, você navega entre as músicas com um clique, mantendo os tons ajustados para cada momento.
        </p>
      </section>

      <div className="bg-blue-50 p-8 rounded-3xl space-y-4 border border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Cloud size={20} /> Backup Automático
        </h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          Suas <strong>Listas</strong> e <strong>Preferências de Tons</strong> também são salvas no seu Google Drive (em arquivos ocultos de metadados). 
          Isso garante que, se você trocar de celular ou computador, seu trabalho estará seguro na nuvem.
        </p>
        <button 
           onClick={() => navigate('/')}
           className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold w-full md:w-auto shadow-lg shadow-blue-200"
        >
          Tudo pronto, vamos começar!
        </button>
      </div>
    </div>
  );
};

export default ComoUsar;
