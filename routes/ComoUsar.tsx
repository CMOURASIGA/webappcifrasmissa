
import React from 'react';
import { ArrowLeft, Book, List, RefreshCw, CheckCircle2, Settings, Cloud, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComoUsar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-12 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900">Guia de Início Rápido</h1>
      </div>

      {/* PASSO 1 - FUNDAMENTAL */}
      <section className="space-y-4 relative border-l-4 border-blue-600 pl-6 py-2">
        <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black absolute -left-[22px] top-0 shadow-lg">
          1
        </div>
        <div className="flex items-center gap-3 text-blue-600 font-bold uppercase tracking-wider text-xs">
          <Settings size={16} /> Configuração Obrigatória
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Configure sua Pasta do Drive</h2>
        <p className="text-gray-600 leading-relaxed">
          O sistema não possui músicas próprias; ele lê os arquivos da <strong>sua pasta</strong> no Google Drive.
          Vá em <strong>Ajustes</strong> e cole o ID da pasta (o código no final do link da pasta).
          Clique em <strong>Testar Carga</strong> para confirmar.
        </p>
        <button 
           onClick={() => navigate('/configuracoes')}
           className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          Ir para Ajustes Agora <ChevronRight size={16} />
        </button>
      </section>

      {/* PASSO 2 */}
      <section className="space-y-4 relative border-l-4 border-gray-200 pl-6 py-2">
        <div className="bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-black absolute -left-[22px] top-0 shadow-sm">
          2
        </div>
        <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-wider text-xs">
          <RefreshCw size={16} /> Sincronização
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Importe suas Músicas</h2>
        <p className="text-gray-600 leading-relaxed">
          Com a pasta conectada, vá na <strong>Biblioteca</strong> e clique em <strong>Sincronizar Drive</strong>.
          Isso criará uma cópia local de todos os seus arquivos <code>.txt</code>. 
          O sistema é inteligente: nas próximas vezes, ele só baixará o que foi alterado no Drive.
        </p>
      </section>

      {/* PASSO 3 */}
      <section className="space-y-4 relative border-l-4 border-gray-200 pl-6 py-2">
        <div className="bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-black absolute -left-[22px] top-0 shadow-sm">
          3
        </div>
        <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-wider text-xs">
          <List size={16} /> Organização
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Crie suas Listas (Setlists)</h2>
        <p className="text-gray-600 leading-relaxed">
          Em <strong>Minhas Listas</strong>, monte o repertório da Missa ou Celebração.
          Selecione as músicas na ordem em que serão tocadas. Isso permite navegar entre as cifras com apenas um toque no "Modo Tocar".
        </p>
      </section>

      {/* PASSO 4 */}
      <section className="space-y-4 relative border-l-4 border-gray-200 pl-6 py-2">
        <div className="bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-black absolute -left-[22px] top-0 shadow-sm">
          4
        </div>
        <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-wider text-xs">
          <CheckCircle2 size={16} /> Performance
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Transposição em Tempo Real</h2>
        <p className="text-gray-600 leading-relaxed">
          Abra uma música e mude o tom usando os botões <strong>+</strong> e <strong>-</strong>. 
          O tom ajustado fica salvo automaticamente para você naquela música, mesmo que você feche o aplicativo.
        </p>
      </section>

      <div className="bg-slate-900 p-8 rounded-3xl space-y-4 text-white">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Cloud size={20} className="text-blue-400" /> Sincronização em Nuvem
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Suas <strong>Listas</strong> e <strong>Tons Preferidos</strong> são salvos no seu próprio Drive (em arquivos ocultos).
          Isso significa que você pode desinstalar o app ou trocar de celular e seu trabalho estará seguro.
        </p>
        <button 
           onClick={() => navigate('/')}
           className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold w-full md:w-auto shadow-lg shadow-blue-500/20"
        >
          Entendido, vamos lá!
        </button>
      </div>
    </div>
  );
};

export default ComoUsar;
