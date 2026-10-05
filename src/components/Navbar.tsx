import React from 'react';
import { ShoppingBag, Sun, Moon, User as UserIcon, Flame, Clock, LogOut, Package } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeOrdersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenOrders,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  activeOrdersCount = 0,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, userProfile, logout } = useAuth();
  const { totalItemsCount, subtotal } = useCart();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#131313]/90 dark:bg-[#131313]/90 light:bg-white/90 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#181818] rounded-[10px] flex items-center justify-center relative">
                <span className="text-xl">🍔</span>
                <Flame className="w-3.5 h-3.5 text-red-500 absolute -top-1 -right-1 fill-red-500" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white dark:text-white light:text-zinc-900 block leading-none">
                BURGUER <span className="text-red-600">POWER</span>
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aberto agora &bull; 18h às 23:30
              </span>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar burgers, batatas, combos, bebidas..."
                className="w-full bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 placeholder-zinc-500 dark:placeholder-zinc-500 light:placeholder-zinc-400 rounded-full px-4 py-2 pl-10 text-sm border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500 transition-colors"
              />
              <span className="absolute left-3.5 top-2.5 text-zinc-400 text-sm">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 transition-all hover:border-zinc-700"
              title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-zinc-700" />
              )}
            </button>

            {/* Orders Tracking Button */}
            {user && (
              <button
                onClick={onOpenOrders}
                className="relative p-2 sm:px-3 sm:py-2 rounded-xl text-zinc-300 hover:text-white dark:text-zinc-300 light:text-zinc-700 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 transition-all hover:border-red-600/40 flex items-center gap-1.5"
                title="Meus Pedidos"
              >
                <Package className="w-5 h-5 text-red-500" />
                <span className="hidden lg:inline text-xs font-semibold">Meus Pedidos</span>
                {activeOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md shadow-red-600/50">
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth / Profile Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenOrders}
                  className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-xs text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:border-zinc-700"
                  title="Ver perfil e pedidos"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate font-medium">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-2 sm:p-2.5 rounded-xl text-zinc-400 hover:text-red-400 bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 hover:bg-zinc-800 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 transition-all hover:border-red-500/50"
              >
                <UserIcon className="w-4 h-4 text-red-500" />
                <span>Entrar</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all transform active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-white text-red-600 font-extrabold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {subtotal > 0 ? `R$ ${subtotal.toFixed(2).replace('.', ',')}` : 'Carrinho'}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 placeholder-zinc-500 rounded-full px-4 py-2 pl-9 text-xs border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500"
            />
            <span className="absolute left-3 top-2 text-zinc-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-zinc-400 bg-zinc-800 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
