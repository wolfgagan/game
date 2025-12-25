
import React from 'react';

interface InventoryProps {
  items: string[];
}

const Inventory: React.FC<InventoryProps> = ({ items }) => {
  return (
    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Inventory</h3>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-zinc-600 italic">Empty pockets...</span>
        ) : (
          items.map((item, idx) => (
            <div 
              key={idx}
              className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inventory;
