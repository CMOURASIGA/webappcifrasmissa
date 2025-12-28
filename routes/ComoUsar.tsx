
import React from 'react';
import { ArrowLeft, Book, List, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComoUsar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-12">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900">Como usar o Cifras MISSA</h1>
      </div>

      <section className="space-y-4">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Book size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">1. Gerencie sua Biblioteca</h2>
        <p className="text-gray-600 leading-relaxed">
          O primeiro passo é adicionar suas cifras favoritas. Vá em <strong>Biblioteca</strong> e clique em <strong>Adicionar Nova</strong>.
          Cole a cifra mantendo a formatação (acordes acima das letras). Você também pode definir o tom original da música e adicionar categorias litúrgicas (ex: Entrada, Comunhão).
        </p>
      </section>

      <section className="space-y-4">
        <div className="bg-amber-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <List size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">2. Monte suas Listas (Setlists)</h2>
        <p className="text-gray-600 leading-relaxed">
          Na aba <strong>Minhas Listas</strong>, você organiza o repertório para uma celebração específica. 
          Escolha um nome (ex: Missa de Domingo) e selecione as músicas da sua biblioteca na ordem em que serão tocadas.
        </p>
      </section>

      <section className="space-y-4">
        <div className="bg-emerald-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <RefreshCw size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">3. Transposição de Tom em Tempo Real</h2>
        <p className="text-gray-600 leading-relaxed">
          Ao visualizar uma cifra, use os botões <strong>+</strong> e <strong>-</strong> para mudar o tom da música. 
          O sistema recalcula todos os acordes automaticamente, facilitando a vida do instrumentista sem precisar reescrever a cifra.
        </p>
      </section>

      <section className="space-y-4">
        <div className="bg-slate-800 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">4. Modo Performance</h2>
        <p className="text-gray-600 leading-relaxed">
          Durante a missa ou ensaio, abra sua lista. O sistema permite navegar rapidamente entre as músicas (Anterior/Próxima) sem precisar voltar ao menu. 
          Você também pode ajustar o tom de cada música individualmente dentro da lista, e essa preferência será lembrada durante sua sessão.
        </p>
      </section>

      <div className="bg-gray-100 p-8 rounded-3xl space-y-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Aviso sobre seus dados</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Este aplicativo armazena todas as cifras e listas <strong>apenas no seu navegador atual</strong> (LocalStorage). 
          Se você trocar de dispositivo ou limpar os dados do navegador, suas cifras serão perdidas. 
          Em atualizações futuras, permitiremos sincronização com a nuvem.
        </p>
        <button 
           onClick={() => navigate('/')}
           className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold w-full md:w-auto"
        >
          Entendido, vamos começar!
        </button>
      </div>
    </div>
  );
};

export default ComoUsar;
