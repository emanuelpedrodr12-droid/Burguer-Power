import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Bike, Store, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { HAMBURGUERIA_INFO } from '../data/mockProducts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    items,
    totalItemsCount,
    subtotal,
    deliveryFee,
    total,
    deliveryType,
    setDeliveryType,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isOpen) return null;

  const freeDeliveryThreshold = 120;
  const remainingForFreeDelivery = freeDeliveryThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#161616] dark:bg-[#161616] light:bg-white border-l border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-2xl flex flex-col">
          
          {/* Cart Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white dark:text-white light:text-zinc-900 tracking-tight">
                  Seu Carrinho
                </h2>
                <span className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Esvaziar carrinho"
                  className="p-2 text-zinc-500 hover:text-red-400 transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery Type Selector */}
          <div className="p-4 bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200">
            <div className="grid grid-cols-2 gap-2 bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-200 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Delivery (Entrega)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('retirada')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  deliveryType === 'retirada'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 dark:text-zinc-400 light:text-zinc-600 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Retirar no Balcão</span>
              </button>
            </div>

            {/* Free Delivery Bar */}
            {deliveryType === 'delivery' && (
              <div className="mt-3 text-[11px]">
                {remainingForFreeDelivery > 0 ? (
                  <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1">
                    <span>
                      Faltam <strong className="text-red-500">R$ {remainingForFreeDelivery.toFixed(2).replace('.', ',')}</strong> para Frete Grátis!
                    </span>
                    <span className="font-bold">{Math.round((subtotal / freeDeliveryThreshold) * 100)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parabéns! Você ganhou Frete Grátis! 🎉</span>
                  </div>
                )}
                <div className="w-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-300 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 rounded-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 flex items-center justify-center text-4xl mb-4">
                  🍔
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white light:text-zinc-900 mb-1">
                  Seu carrinho está vazio
                </h3>
                <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-500 text-xs max-w-xs mb-6">
                  Que tal experimentar um dos nossos suculentos smash burgers artesanais?
                </p>
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all"
                >
                  Explorar o Cardápio
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-zinc-50 p-3.5 rounded-2xl border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 flex gap-3 relative group"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-800"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-extrabold text-sm text-white dark:text-white light:text-zinc-900 truncate">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-zinc-500 hover:text-red-500 p-1 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Extras */}
                    {item.selectedExtras.length > 0 && (
                      <div className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 my-0.5 line-clamp-2">
                        + {item.selectedExtras.map((e) => e.name).join(', ')}
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div className="text-[11px] text-amber-400/90 italic truncate">
                        Obs: "{item.notes}"
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/40 dark:border-zinc-800/40 light:border-zinc-200">
                      <div className="flex items-center gap-2 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 rounded bg-zinc-700 dark:bg-zinc-700 light:bg-white text-white dark:text-white light:text-zinc-900 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white dark:text-white light:text-zinc-900 px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-red-500">
                        R$ {item.itemTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-zinc-900/95 dark:bg-zinc-900/95 light:bg-zinc-50 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white dark:text-white light:text-zinc-900">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                  <span>Taxa de Entrega ({deliveryType === 'delivery' ? 'Delivery' : 'Retirada'})</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold uppercase text-[11px]">Grátis</span>
                    ) : (
                      `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-sm">
                  <span className="font-bold text-white dark:text-white light:text-zinc-900">Total do Pedido</span>
                  <span className="font-black text-xl text-red-500">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-red-600 hover:bg-red-500 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Avançar para Confirmação</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 transition-colors py-1"
              >
                Continuar escolhendo produtos
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
