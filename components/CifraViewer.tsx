
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
      className="font-mono whitespace-pre overflow-x-auto p-4 md:p-8 bg-white rounded-xl shadow-sm border border-gray-100 leading-relaxed"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, idx) => {
        const isChords = isChordLine(line);
        if (isChords) {
          return (
            <div key={idx} className="text-blue-700 font-bold min-h-[1.5em] select-none">
              {line}
            </div>
          );
        }
        return (
          <div key={idx} className="text-gray-800 min-h-[1.5em]">
            {line}
          </div>
        );
      })}
    </div>
  );
};

export default CifraViewer;
