import React from 'react';
import { Plus, Star, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenModal,
  onQuickAdd,
}) => {
  const formattedPrice = `R$ ${product.price.toFixed(2).replace('.', ',')}`;

  return (
    <div
      onClick={() => onOpenModal(product)}
      className="group relative flex flex-col justify-between bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white rounded-3xl overflow-hidden border border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-200 hover:border-red-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/10 cursor-pointer"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-16/11 w-full overflow-hidden bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.isPopular && (
              <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
                <Sparkles className="w-3 h-3" />
                Mais Pedido
              </span>
            )}
            {product.tags && product.tags.length > 0 && !product.isPopular && (
              <span className="bg-zinc-900/80 backdrop-blur-md text-zinc-200 text-[10px] font-bold px-2.5 py-1 rounded-full border border-zinc-700/60 shadow">
                {product.tags[0]}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-2">
          <h3 className="font-extrabold text-base sm:text-lg text-white dark:text-white light:text-zinc-900 group-hover:text-red-500 transition-colors line-clamp-1">
            {product.title}
          </h3>

          <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Price & Add to Cart button */}
      <div className="p-4 sm:p-5 pt-0 mt-2 flex items-center justify-between gap-3 border-t border-zinc-800/40 dark:border-zinc-800/40 light:border-zinc-100">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
            A partir de
          </span>
          <span className="text-lg sm:text-xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight">
            {formattedPrice}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (product.extrasAllowed && product.extrasAllowed.length > 0) {
              onOpenModal(product);
            } else {
              onQuickAdd(product);
            }
          }}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          title="Adicionar ao carrinho"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Adicionar</span>
        </button>
      </div>
    </div>
  );
};
