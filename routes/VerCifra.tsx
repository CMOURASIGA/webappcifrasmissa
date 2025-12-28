
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Type, ZoomIn, ZoomOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CifraViewer from '../components/CifraViewer';
import TransposeControls from '../components/TransposeControls';

const VerCifra: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cifras, config } = useApp();
  const cifra = cifras.find(c => c.id === id);
  
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(16);

  if (!cifra) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-gray-500">Música não encontrada.</p>
        <button onClick={() => navigate('/biblioteca')} className="text-blue-600 font-bold hover:underline">
          Voltar para Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-none">{cifra.titulo}</h1>
              <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">Tom Original: {cifra.tomBase}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-center md:self-auto">
             <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => setFontSize(s => Math.max(10, s - 2))} className="p-1.5 hover:bg-white rounded text-gray-500"><ZoomOut size={18}/></button>
                <div className="px-2 text-xs font-bold text-gray-500"><Type size={14}/></div>
                <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="p-1.5 hover:bg-white rounded text-gray-500"><ZoomIn size={18}/></button>
             </div>
             <TransposeControls 
               amount={transpose} 
               onChange={setTranspose} 
               onReset={() => setTranspose(0)} 
             />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 mt-4">
        <CifraViewer 
          conteudo={cifra.conteudo} 
          transposeAmount={transpose} 
          fontSize={fontSize} 
        />
      </div>

      <div className="fixed bottom-6 right-6 hidden md:block">
        <button className="bg-white border border-gray-200 p-4 rounded-full shadow-lg text-gray-700 hover:text-blue-600 transition-all hover:scale-105 active:scale-95">
           <Edit3 size={24} />
        </button>
      </div>
    </div>
  );
};

export default VerCifra;
