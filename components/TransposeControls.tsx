
import React from 'react';
import { Minus, Plus, RefreshCw } from 'lucide-react';

interface TransposeControlsProps {
  amount: number;
  onChange: (newAmount: number) => void;
  onReset: () => void;
}

const TransposeControls: React.FC<TransposeControlsProps> = ({ amount, onChange, onReset }) => {
  return (
    <div className="flex items-center bg-white/5 rounded-lg p-0.5">
      <button
        onClick={() => onChange(amount - 1)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white active:scale-90 transition-all"
      >
        <Minus size={12} />
      </button>
      
      <div className="px-2 flex flex-col items-center justify-center min-w-[35px]">
        <span className="text-[6px] text-slate-500 font-black uppercase leading-none">Tom</span>
        <span className="font-black text-amber-500 text-[10px] leading-none">
          {amount > 0 ? `+${amount}` : amount}
        </span>
      </div>

      <button
        onClick={() => onChange(amount + 1)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-white active:scale-90 transition-all"
      >
        <Plus size={12} />
      </button>

      <button
        onClick={onReset}
        disabled={amount === 0}
        className={`ml-1 w-7 h-7 flex items-center justify-center rounded-md transition-all ${
          amount === 0 ? 'text-white/10' : 'text-amber-400 hover:bg-amber-400/10 active:scale-90'
        }`}
      >
        <RefreshCw size={10} />
      </button>
    </div>
  );
};

export default TransposeControls;
