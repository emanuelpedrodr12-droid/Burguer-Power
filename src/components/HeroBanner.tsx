import React from 'react';
import { Flame, Clock, ShieldCheck, Sparkles, Bike } from 'lucide-react';
import { HAMBURGUERIA_INFO } from '../data/mockProducts';

interface HeroBannerProps {
  onScrollToMenu: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onScrollToMenu }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-[#181818] to-zinc-950 border border-zinc-800/80 shadow-2xl my-6">
      {/* Glow effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Information */}
        <div className="max-w-xl text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-semibold mb-4 tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 fill-red-500" />
            <span>Hamburgueria Artesanal &bull; Chapa Quente</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            O sabor mais potente da cidade no seu delivery.
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Smash burgers ultra prensados, blends nobres de Angus 180g, batatas rústicas com fondue de cheddar e molhos secretos da casa. Faça seu pedido em segundos e receba quentinho!
          </p>

          {/* Quick Metrics / Badges */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 pb-6 border-t border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <Bike className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">30 - 45 min</div>
                <div className="text-[10px] text-zinc-500">Entrega rápida</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">4.9 / 5.0</div>
                <div className="text-[10px] text-zinc-500">+1.500 avaliações</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">PIX & Cartão</div>
                <div className="text-[10px] text-zinc-500">Pagamento fácil</div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <button
              onClick={onScrollToMenu}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 transform active:scale-95 text-sm"
            >
              <span>Ver Cardápio Completo</span>
              <span className="text-lg">🍔</span>
            </button>
            <a
              href={`https://wa.me/${HAMBURGUERIA_INFO.whatsappNumber}?text=${encodeURIComponent('Olá Burguer Power! Gostaria de tirar uma dúvida sobre o cardápio.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold px-5 py-3 rounded-xl border border-zinc-700/60 transition-all text-sm flex items-center gap-2"
            >
              <span>Falar no WhatsApp</span>
              <span className="text-emerald-400 text-base">💬</span>
            </a>
          </div>

        </div>

        {/* Right Feature Card Image */}
        <div className="relative w-full max-w-sm lg:max-w-md shrink-0">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 aspect-4/3 group">
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
              alt="Power Smash Burger Destaque"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md mb-1 shadow">
                Campeão de Vendas
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Power Smash Classic Duplo
              </h3>
              <p className="text-zinc-300 text-xs line-clamp-1">
                2x Smash 90g com crosta perfeita e cheddar melt
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-red-400 font-extrabold text-base">
                  R$ 28,90
                </span>
                <span className="text-emerald-400 text-xs font-semibold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-600/30">
                  Pronto em 15 min
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
