import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutScreen } from './components/CheckoutScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { PRODUCTS_DATA } from './data/mockProducts';
import { Product, ProductCategory, ExtraOption, Order } from './types';
import { ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

function MainAppContent() {
  const { user } = useAuth();
  const { totalItemsCount, subtotal, isCartOpen, setIsCartOpen, addToCart } = useCart();

  // Navigation & Screen View
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'menu' | 'checkout' | 'orders'>('menu');
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  // Search & Filter
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Quick feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time active orders counter
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Real-time active orders listener for navbar badge
  useEffect(() => {
    if (!user) {
      setActiveOrdersCount(0);
      return;
    }
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach((d) => {
        const order = d.data() as Order;
        if (order.status === 'recebido' || order.status === 'em_preparo' || order.status === 'saiu_entrega') {
          count++;
        }
      });
      setActiveOrdersCount(count);
    }, (error) => {
      console.warn('Realtime badge error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return PRODUCTS_DATA.filter((product) => {
      const matchesCategory =
        selectedCategory === 'todos' || product.category === selectedCategory;

      const normalizedSearch = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !normalizedSearch ||
        product.title.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch) ||
        product.tags?.some((t) => t.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1, [], '');
    triggerToast(`1x ${product.title} adicionado ao carrinho!`);
  };

  const handleModalAddToCart = (
    product: Product,
    quantity: number,
    extras: ExtraOption[],
    notes: string
  ) => {
    addToCart(product, quantity, extras, notes);
    triggerToast(`${quantity}x ${product.title} adicionado ao carrinho!`);
  };

  const handleOrderSuccess = (orderId: string) => {
    setHighlightOrderId(orderId);
    setCurrentView('orders');
    triggerToast(`Pedido #${orderId} enviado com sucesso!`);
  };

  const scrollToMenu = () => {
    if (menuRef.current) {
      menuRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#131313] dark:bg-[#131313] light:bg-[#FAFAFA] text-zinc-100 dark:text-zinc-100 light:text-zinc-900 transition-colors duration-200">
      
      {/* 1. Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 2. Top Header Navbar */}
      <Navbar
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setIsAuthOpen(true);
        }}
        onOpenOrders={() => setCurrentView('orders')}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-zinc-900 dark:bg-zinc-900 light:bg-white text-white dark:text-white light:text-zinc-900 border border-red-500/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Body Routing */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* VIEW: Orders History & Real-Time Tracking */}
        {currentView === 'orders' && (
          <OrdersScreen
            onBack={() => setCurrentView('menu')}
            onOpenAuth={() => {
              setAuthInitialMode('login');
              setIsAuthOpen(true);
            }}
            highlightOrderId={highlightOrderId}
          />
        )}

        {/* VIEW: Checkout & WhatsApp Confirmation */}
        {currentView === 'checkout' && (
          <CheckoutScreen
            onBack={() => setCurrentView('menu')}
            onOrderSuccess={handleOrderSuccess}
            onOpenAuth={() => {
              setAuthInitialMode('login');
              setIsAuthOpen(true);
            }}
          />
        )}

        {/* VIEW: Menu Catalog (Home Screen) */}
        {currentView === 'menu' && (
          <>
            {/* Promotional Banner */}
            <HeroBanner onScrollToMenu={scrollToMenu} />

            {/* Menu Section */}
            <div ref={menuRef} className="pt-4 pb-12">
              
              {/* Category Pills Filter */}
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight flex items-center gap-2">
                    <span className="text-red-500">🔥</span>
                    <span>
                      {selectedCategory === 'todos'
                        ? 'Nosso Cardápio Completo'
                        : selectedCategory === 'smash'
                        ? 'Smash Burgers Artesanais'
                        : selectedCategory === 'artesanais'
                        ? 'Linha Premium Angus & Costela'
                        : selectedCategory === 'combos'
                        ? 'Combos Power com Batata e Refri'
                        : selectedCategory === 'acompanhamentos'
                        ? 'Porções Crocantes & Batatas'
                        : selectedCategory === 'bebidas'
                        ? 'Bebidas Super Geladas'
                        : 'Sobremesas & Milk Shakes'}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'opção disponível' : 'opções irresistíveis disponíveis'}
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold self-start sm:self-auto"
                  >
                    Limpar busca "{searchQuery}" &times;
                  </button>
                )}
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 p-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-base font-bold text-white dark:text-white light:text-zinc-900 mb-1">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-4">
                    Não encontramos resultados para a sua busca ou categoria selecionada.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('todos');
                      setSearchQuery('');
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    Ver Todo o Cardápio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenModal={setSelectedProductForModal}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              )}

            </div>
          </>
        )}

      </main>

      {/* Floating Bottom Cart Bar for Mobile */}
      {currentView === 'menu' && totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold p-4 rounded-2xl shadow-2xl shadow-red-600/50 flex items-center justify-between border border-red-500/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                {totalItemsCount}
              </div>
              <span className="text-sm">Ver Carrinho</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </div>
          </button>
        </div>
      )}

      {/* Product Customizer Modal */}
      <ProductModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleModalAddToCart}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setCurrentView('checkout')}
      />

      {/* Auth Modal (Login / Cadastro) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
