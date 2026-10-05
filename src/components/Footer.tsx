import React from 'react';
import { Flame, Clock, MapPin, Phone, Instagram, Facebook, Heart } from 'lucide-react';
import { HAMBURGUERIA_INFO } from '../data/mockProducts';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 dark:bg-zinc-950 light:bg-zinc-100 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Slogan */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 flex items-center justify-center">
                <span className="text-base">🍔</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white dark:text-white light:text-zinc-900">
                BURGUER <span className="text-red-500">POWER</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {HAMBURGUERIA_INFO.slogan}. Smash burgers artesanais, carnes nobres grelhadas na brasa e os melhores ingredientes.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-red-600 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-red-600 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Horário */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white dark:text-white light:text-zinc-900 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-500" />
              <span>Horário de Funcionamento</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-zinc-400">
              <li><strong className="text-zinc-300 dark:text-zinc-300 light:text-zinc-800">Terça a Domingo:</strong> 18:00 às 23:30</li>
              <li><strong className="text-zinc-300 dark:text-zinc-300 light:text-zinc-800">Segunda-feira:</strong> Fechado (Descanso da equipe)</li>
              <li className="pt-2 text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Delivery e Balcão ativos
              </li>
            </ul>
          </div>

          {/* Localização & Contato */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white dark:text-white light:text-zinc-900 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Onde Estamos</span>
            </h4>
            <p className="text-xs text-zinc-400 mb-2">
              {HAMBURGUERIA_INFO.address}
            </p>
            <a
              href={`https://wa.me/${HAMBURGUERIA_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp: {HAMBURGUERIA_INFO.formattedPhone}</span>
            </a>
          </div>

          {/* Pagamentos Aceitos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white dark:text-white light:text-zinc-900 mb-3">
              Formas de Pagamento
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-300 dark:text-zinc-300 light:text-zinc-800 font-bold">
                ⚡ PIX Direto
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-300 dark:text-zinc-300 light:text-zinc-800">
                💳 Crédito / Débito
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-300 dark:text-zinc-300 light:text-zinc-800">
                💵 Dinheiro c/ Troco
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-200 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 text-zinc-300 dark:text-zinc-300 light:text-zinc-800">
                🎟️ Vale Refeição (VR)
              </span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} Burguer Power Gastronomia. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> e muita brasa.
          </p>
        </div>
      </div>
    </footer>
  );
};
