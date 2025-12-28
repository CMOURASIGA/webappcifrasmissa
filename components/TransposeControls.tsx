
import React from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';

interface TransposeControlsProps {
  amount: number;
  onChange: (newAmount: number) => void;
  onReset: () => void;
}

const TransposeControls: React.FC<TransposeControlsProps> = ({ amount, onChange, onReset }) => {
  return (
    <div className="flex items-center bg-white rounded-full p-0.5 shadow-md border border-gray-200">
      <button
        onClick={() => onChange(amount - 1)}
        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition-transform"
        title="Diminuir tom"
      >
        <Minus size={16} />
      </button>
      
      <div className="px-2 md:px-4 flex flex-col items-center justify-center min-w-[40px] md:min-w-[60px]">
        <span className="text-[8px] md:text-xs text-gray-400 font-bold uppercase leading-none mb-0.5">Tom</span>
        <span className="font-bold text-blue-600 text-xs md:text-base leading-none">
          {amount > 0 ? `+${amount}` : amount}
        </span>
      </div>

      <button
        onClick={() => onChange(amount + 1)}
        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition-transform"
        title="Aumentar tom"
      >
        <Plus size={16} />
      </button>

      <div className="w-[1px] h-4 md:h-6 bg-gray-200 mx-0.5"></div>

      <button
        onClick={onReset}
        disabled={amount === 0}
        className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full transition-all ${
          amount === 0 ? 'text-gray-300' : 'text-amber-500 hover:bg-amber-50 active:scale-95'
        }`}
        title="Resetar tom original"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  );
};

export default TransposeControls;
