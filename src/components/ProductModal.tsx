import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles, MessageSquare } from 'lucide-react';
import { Product, ExtraOption } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, extras: ExtraOption[], notes: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [notes, setNotes] = useState('');

  const toggleExtra = (extra: ExtraOption) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const extrasCost = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const totalItemPrice = (product.price + extrasCost) * quantity;

  const handleConfirm = () => {
    onAddToCart(product, quantity, selectedExtras, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-[#181818] dark:bg-[#181818] light:bg-white rounded-3xl shadow-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Header Image */}
          <div className="relative aspect-16/9 w-full bg-zinc-900">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />
            
            {product.isPopular && (
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 bg-red-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-lg">
                <Sparkles className="w-3.5 h-3.5" />
                Destaque da Casa
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight mb-2">
              {product.title}
            </h2>

            <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Extras Section */}
            {product.extrasAllowed && product.extrasAllowed.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 dark:text-zinc-300 light:text-zinc-800">
                    Turbine seu Burger (Adicionais)
                  </h3>
                  <span className="text-[11px] text-zinc-500 font-medium">Opcional</span>
                </div>

                <div className="space-y-2">
                  {product.extrasAllowed.map((extra) => {
                    const isChecked = selectedExtras.some((e) => e.id === extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleExtra(extra)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? 'bg-red-600/10 border-red-500 text-white'
                            : 'bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-zinc-100 border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              isChecked
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'border-zinc-600 dark:border-zinc-600 light:border-zinc-400'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-sm font-semibold">{extra.name}</span>
                        </div>
                        <span className="text-xs font-bold text-red-500">
                          + R$ {extra.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Observation / Special Notes */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-700 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                <span>Observações do item</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Ponto da carne bem passada, sem cebola, maionese à parte..."
                rows={2}
                maxLength={300}
                className="w-full bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 placeholder-zinc-500 dark:placeholder-zinc-500 light:placeholder-zinc-400 text-sm p-3.5 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-300 focus:outline-none focus:border-red-500 resize-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-zinc-50 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 flex items-center justify-between gap-4">
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 p-1 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-zinc-700 dark:bg-zinc-700 light:bg-white text-white dark:text-white light:text-zinc-900 disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-white dark:text-white light:text-zinc-900 text-base min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 active:scale-98 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-between cursor-pointer"
          >
            <span>Adicionar</span>
            <span className="text-base font-black">
              R$ {totalItemPrice.toFixed(2).replace('.', ',')}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};
