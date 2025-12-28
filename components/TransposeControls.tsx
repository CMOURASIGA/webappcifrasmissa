
import React from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';

interface TransposeControlsProps {
  amount: number;
  onChange: (newAmount: number) => void;
  onReset: () => void;
}

const TransposeControls: React.FC<TransposeControlsProps> = ({ amount, onChange, onReset }) => {
  return (
    <div className="flex items-center gap-2 bg-white rounded-full p-1 shadow-md border border-gray-200">
      <button
        onClick={() => onChange(amount - 1)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition-transform"
        title="Diminuir tom"
      >
        <Minus size={20} />
      </button>
      
      <div className="px-4 py-1 flex flex-col items-center justify-center min-w-[60px]">
        <span className="text-xs text-gray-400 font-bold uppercase">Tom</span>
        <span className="font-bold text-blue-600">
          {amount > 0 ? `+${amount}` : amount}
        </span>
      </div>

      <button
        onClick={() => onChange(amount + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 active:scale-95 transition-transform"
        title="Aumentar tom"
      >
        <Plus size={20} />
      </button>

      <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

      <button
        onClick={onReset}
        disabled={amount === 0}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
          amount === 0 ? 'text-gray-300' : 'text-amber-500 hover:bg-amber-50 active:scale-95'
        }`}
        title="Resetar tom original"
      >
        <RefreshCw size={18} />
      </button>
    </div>
  );
};

export default TransposeControls;
