
import React from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';

interface TransposeControlsProps {
  amount: number;
  onChange: (newAmount: number) => void;
  onReset: () => void;
}

const TransposeControls: React.FC<TransposeControlsProps> = ({ amount, onChange, onReset }) => {
  return (
    <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
      <button
        onClick={() => onChange(amount - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white active:scale-95 transition-transform"
        title="Diminuir tom"
      >
        <Minus size={14} />
      </button>
      
      <div className="px-3 flex flex-col items-center justify-center min-w-[45px]">
        <span className="text-[7px] text-slate-400 font-bold uppercase leading-none mb-0.5">Tom</span>
        <span className="font-bold text-blue-400 text-xs leading-none">
          {amount > 0 ? `+${amount}` : amount}
        </span>
      </div>

      <button
        onClick={() => onChange(amount + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white active:scale-95 transition-transform"
        title="Aumentar tom"
      >
        <Plus size={14} />
      </button>

      <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

      <button
        onClick={onReset}
        disabled={amount === 0}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
          amount === 0 ? 'text-white/20' : 'text-amber-400 hover:bg-amber-400/10 active:scale-95'
        }`}
        title="Resetar tom original"
      >
        <RefreshCw size={12} />
      </button>
    </div>
  );
};

export default TransposeControls;
