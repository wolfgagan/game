
import React, { useState, useEffect, useRef } from 'react';
import { GameState } from './types';
import { processGameAction, generateSceneImage } from './services/geminiService';
import StatsBar from './components/StatsBar';
import Inventory from './components/Inventory';

const INITIAL_STATE: GameState = {
  characterName: 'Kaelen',
  health: 100,
  mana: 80,
  inventory: ['Rusted Dagger', 'Lesser Healing Potion'],
  location: 'Echoing Crypts',
  history: [
    {
      type: 'narrative',
      content: 'The air is thick with the scent of damp stone and ancient decay. You stand at the threshold of the Echoing Crypts, your torch flickering against the oppressive darkness. Ahead, a heavy iron-bound door stands slightly ajar.',
    },
  ],
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [gameState.history, isLoading]);

  useEffect(() => {
    const initImage = async () => {
      const img = await generateSceneImage("A dark ancient crypt entrance with flickering torches and stone walls");
      setCurrentImage(img);
    };
    initImage();
  }, []);

  const handleAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const actionText = input.trim();
    setInput('');
    setIsLoading(true);

    setGameState(prev => ({
      ...prev,
      history: [...prev.history, { type: 'action', content: actionText }]
    }));

    try {
      const response = await processGameAction(actionText, gameState);
      
      const newInventory = [...gameState.inventory]
        .filter(item => !response.lostInventoryItems.includes(item))
        .concat(response.newInventoryItems);

      const nextHealth = Math.max(0, Math.min(100, gameState.health + response.healthChange));
      const nextMana = Math.max(0, Math.min(100, gameState.mana + response.manaChange));

      const newImage = await generateSceneImage(response.imagePrompt);
      if (newImage) setCurrentImage(newImage);

      setGameState(prev => ({
        ...prev,
        health: nextHealth,
        mana: nextMana,
        inventory: newInventory,
        location: response.location,
        history: [...prev.history, { 
          type: 'narrative', 
          content: response.narrative,
          image: newImage || undefined 
        }]
      }));

    } catch (error) {
      console.error(error);
      setGameState(prev => ({
        ...prev,
        history: [...prev.history, { type: 'system', content: 'The winds of fate are turbulent. Please try your action again.' }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">
      <aside className="w-full md:w-80 p-6 flex flex-col gap-6 border-r border-zinc-900 bg-[#080808]">
        <div className="mb-4">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500 tracking-tighter">AETHERIA</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Chronicles of the Void</p>
        </div>

        <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Identity</h2>
          </div>
          <p className="font-cinzel text-lg text-zinc-200">{gameState.characterName}</p>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">Location: {gameState.location}</p>
        </div>

        <StatsBar health={gameState.health} mana={gameState.mana} />
        <Inventory items={gameState.inventory} />

        <div className="mt-auto p-4 bg-amber-900/10 border border-amber-900/20 rounded-xl text-[10px] text-amber-800 uppercase tracking-widest text-center">
          Ver. 1.0.5 - Engine Refined
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent"></div>

        <section className="h-[35vh] md:h-[45vh] relative border-b border-zinc-900 overflow-hidden group">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Current Scene" 
              className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <div className="text-zinc-800 animate-pulse font-cinzel text-xl uppercase tracking-widest">
                Visualizing Fate...
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60"></div>
          
          {isLoading && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/80 rounded-full border border-zinc-800 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">The Void is Thinking</span>
            </div>
          )}
        </section>

        <section className="flex-1 overflow-y-auto p-6 space-y-8 relative scroll-smooth">
          {gameState.history.map((entry, idx) => (
            <div 
              key={idx} 
              className="max-w-3xl mx-auto flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              {entry.type === 'action' ? (
                <div className="flex justify-end">
                  <div className="bg-amber-900/10 border border-amber-900/30 text-amber-200/80 px-4 py-2 rounded-lg text-sm italic">
                    "{entry.content}"
                  </div>
                </div>
              ) : entry.type === 'system' ? (
                <div className="text-center text-[10px] text-red-500 uppercase tracking-[0.2em] bg-red-950/10 py-2 rounded-lg border border-red-900/10">
                  {entry.content}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-zinc-300 leading-relaxed font-light text-lg selection:bg-amber-900/50">
                    {entry.content}
                  </p>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="max-w-3xl mx-auto opacity-30 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
             </div>
          )}
          <div ref={logEndRef} className="h-1" />
        </section>

        <section className="p-6 bg-[#080808] border-t border-zinc-900">
          <form 
            onSubmit={handleAction}
            className="max-w-3xl mx-auto relative group"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Fate is writing..." : "What is your command?"}
              disabled={isLoading}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 pr-16 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-900/50 focus:ring-1 focus:ring-amber-900/20 transition-all disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 p-2 rounded-lg transition-all shadow-lg shadow-amber-900/20 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default App;
