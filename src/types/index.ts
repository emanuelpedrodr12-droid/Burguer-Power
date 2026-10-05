export type ProductCategory = 
  | 'todos'
  | 'smash'
  | 'artesanais'
  | 'combos'
  | 'acompanhamentos'
  | 'bebidas'
  | 'sobremesas';

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  available?: boolean;
  rating?: number;
  reviewsCount?: number;
  tags?: string[];
  isPopular?: boolean;
  extrasAllowed?: ExtraOption[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedExtras: ExtraOption[];
  notes?: string;
  itemTotal: number;
}

export type OrderStatus = 'recebido' | 'em_preparo' | 'saiu_entrega' | 'concluido' | 'cancelado';

export type DeliveryType = 'delivery' | 'retirada';

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export interface AddressInfo {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  extras?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: string;
  paymentMethod: PaymentMethod;
  changeFor?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}
