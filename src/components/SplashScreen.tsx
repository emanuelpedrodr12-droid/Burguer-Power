import React, { useEffect, useState } from 'react';
import { Flame, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#131313] text-white p-6 select-none overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        {/* Animated Brand Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 p-1 shadow-2xl shadow-red-600/50 flex items-center justify-center transform transition-transform hover:scale-105 duration-300">
            <div className="w-full h-full bg-[#171717] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-4xl sm:text-5xl select-none filter drop-shadow-md">🍔</span>
              <div className="absolute -bottom-1 text-red-500 flex items-center justify-center">
                <Flame className="w-6 h-6 fill-red-500 animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Title & Slogan */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          BURGUER <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">POWER</span>
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base font-medium mb-8">
          O Poder do Verdadeiro Hambúrguer Artesanal
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800/80 rounded-full h-2 mb-3 overflow-hidden border border-zinc-700/50">
          <div
            className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-xs text-zinc-500 font-mono mb-6">
          <span>Aquecendo a chapa...</span>
          <span className="text-red-400 font-bold">{progress}%</span>
        </div>

        {/* Skip button */}
        <button
          onClick={onFinish}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-800/60 hover:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-700/60"
        >
          <span>Pular para o cardápio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer credits in splash */}
      <div className="absolute bottom-6 text-center text-xs text-zinc-600">
        Burguer Power &bull; Cardápio Digital em Tempo Real
      </div>
    </div>
  );
};
