import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ExtraOption, DeliveryType } from '../types';
import { HAMBURGUERIA_INFO } from '../data/mockProducts';

interface CartContextType {
  items: CartItem[];
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, extras?: ExtraOption[], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('burguer_power_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('burguer_power_cart', JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    extras: ExtraOption[] = [],
    notes: string = ''
  ) => {
    const extrasKey = extras
      .map(e => e.id)
      .sort()
      .join('-');
    const cartItemId = `${product.id}_${extrasKey}_${notes.trim().toLowerCase()}`;

    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === cartItemId);
      const extrasCost = extras.reduce((sum, e) => sum + e.price, 0);
      const singleUnitCost = product.price + extrasCost;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          itemTotal: singleUnitCost * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          product,
          quantity,
          selectedExtras: extras,
          notes: notes.trim(),
          itemTotal: singleUnitCost * quantity,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const singleUnitCost =
              item.product.price +
              item.selectedExtras.reduce((sum, e) => sum + e.price, 0);
            return {
              ...item,
              quantity: newQty,
              itemTotal: singleUnitCost * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
  
  // Delivery fee: 0 if 'retirada' or cart is empty; free delivery on orders above R$ 120
  const deliveryFee = deliveryType === 'retirada' || items.length === 0 
    ? 0 
    : subtotal >= 120 
      ? 0 
      : HAMBURGUERIA_INFO.deliveryFee;

  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        deliveryFee,
        total,
        deliveryType,
        setDeliveryType,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
