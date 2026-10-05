import React from 'react';
import { ProductCategory } from '../types';
import { CATEGORIES_CONFIG } from '../data/mockProducts';
import { Sparkles, Flame, Utensils, Layers, Box, Coffee, IceCream } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'Box': return <Box className="w-4 h-4" />;
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'IceCream': return <IceCream className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="py-2 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {CATEGORIES_CONFIG.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 select-none cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-102 border border-red-500'
                  : 'bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-zinc-100 text-zinc-300 dark:text-zinc-300 light:text-zinc-700 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-zinc-200 border border-zinc-800 dark:border-zinc-800 light:border-zinc-300'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-red-500'}>
                {getIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
