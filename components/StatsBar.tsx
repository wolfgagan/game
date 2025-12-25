
import React from 'react';

interface StatsBarProps {
  health: number;
  mana: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ health, mana }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
          <span>Vitality</span>
          <span>{health}%</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-600 transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" 
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
          <span>Aether</span>
          <span>{mana}%</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
            style={{ width: `${mana}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
