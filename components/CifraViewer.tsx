
import React, { useMemo } from 'react';
import { transposeText, isChordLine } from '../services/chordService';

interface CifraViewerProps {
  conteudo: string;
  transposeAmount: number;
  fontSize?: number;
}

const CifraViewer: React.FC<CifraViewerProps> = ({ conteudo, transposeAmount, fontSize = 16 }) => {
  const transposedContent = useMemo(() => {
    return transposeText(conteudo, transposeAmount);
  }, [conteudo, transposeAmount]);

  const lines = transposedContent.split('\n');

  return (
    <div 
      className="font-mono whitespace-pre overflow-x-auto p-1.5 md:p-8 bg-white rounded-lg leading-[1.15] md:leading-relaxed"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, idx) => {
        const isChords = isChordLine(line);
        if (isChords) {
          return (
            <div key={idx} className="text-blue-700 font-bold min-h-[1.1em] select-none">
              {line}
            </div>
          );
        }
        // Se a linha for vazia, mantemos um pequeno espaço para separar versos
        if (!line.trim()) {
          return <div key={idx} className="h-[0.5em]"></div>;
        }
        return (
          <div key={idx} className="text-gray-900 min-h-[1.1em]">
            {line}
          </div>
        );
      })}
    </div>
  );
};

export default CifraViewer;
