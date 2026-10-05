import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  MessageSquare, 
  ArrowLeft, 
  Bike, 
  ChefHat, 
  Store,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus } from '../types';
import { HAMBURGUERIA_INFO, PRODUCTS_DATA } from '../data/mockProducts';

interface OrdersScreenProps {
  onBack: () => void;
  onOpenAuth: () => void;
  highlightOrderId?: string | null;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  onBack,
  onOpenAuth,
  highlightOrderId,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(highlightOrderId || null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Realtime listener with strict RLS enforcement (userId == request.auth.uid)
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Order[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as Order);
        });
        // Sort descending by date
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Realtime orders error:', error);
        handleFirestoreError(error, OperationType.LIST, 'orders');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCancelOrder = async (order: Order) => {
    if (!confirm('Deseja realmente cancelar este pedido?')) return;
    try {
      setActionError('');
      await updateDoc(doc(db, 'orders', order.id), {
        status: 'cancelado',
        updatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.error('Cancel order error:', err);
      setActionError('Não foi possível cancelar o pedido. Se já estiver a caminho, fale com o suporte.');
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Deseja remover este pedido cancelado do seu histórico?')) return;
    try {
      setActionError('');
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (err: unknown) {
      console.error('Delete order error:', err);
      setActionError('Não foi possível remover o pedido do histórico.');
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const handleRepeatOrder = (order: Order) => {
    order.items.forEach((item) => {
      const originalProduct = PRODUCTS_DATA.find((p) => p.id === item.productId) || {
        id: item.productId,
        title: item.title,
        description: 'Item do pedido anterior',
        price: item.price,
        category: 'smash' as const,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      };
      addToCart(originalProduct, item.quantity, [], item.notes || '');
    });
    alert('Itens adicionados ao seu carrinho!');
    onBack();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'recebido':
        return {
          label: 'Recebido na Cozinha',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400 animate-pulse',
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 1,
        };
      case 'em_preparo':
        return {
          label: 'Na Chapa / Em Preparo',
          color: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-400 animate-pulse',
          icon: <ChefHat className="w-3.5 h-3.5" />,
          step: 2,
        };
      case 'saiu_entrega':
        return {
          label: 'Saiu para Entrega',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400 animate-ping',
          icon: <Bike className="w-3.5 h-3.5" />,
          step: 3,
        };
      case 'concluido':
        return {
          label: 'Entregue / Concluído',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          step: 4,
        };
      case 'cancelado':
        return {
          label: 'Pedido Cancelado',
          color: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
          icon: <XCircle className="w-3.5 h-3.5" />,
          step: 0,
        };
    }
  };

  const openWhatsAppContact = (order: Order) => {
    const text = `Olá Burguer Power! Gostaria de informações sobre meu pedido *#${order.id}* feito em ${new Date(order.createdAt).toLocaleDateString('pt-BR')}.`;
    const url = `https://wa.me/${HAMBURGUERIA_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 flex items-center justify-center text-4xl mx-auto mb-4">
          🔒
        </div>
        <h2 className="text-2xl font-black text-white dark:text-white light:text-zinc-900 mb-2">
          Acesse seus Pedidos
        </h2>
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm mb-6 max-w-sm mx-auto">
          Faça login para acompanhar o status em tempo real dos seus lanches e ver seu histórico completo.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl shadow-red-600/30 transition-all cursor-pointer"
        >
          Entrar ou Criar Conta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 text-sm font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Cardápio</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-red-500" />
            <span>Meus Pedidos em Tempo Real</span>
          </h1>
          <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs sm:text-sm mt-1">
            Atualizações automáticas da chapa ao seu endereço via Firestore em tempo real.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-900 light:bg-zinc-100 border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sincronização ativa</span>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-600/15 border border-red-500/40 text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-zinc-400">Carregando seus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 rounded-3xl p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 flex items-center justify-center text-4xl mx-auto mb-4">
            🛵
          </div>
          <h3 className="text-lg font-black text-white dark:text-white light:text-zinc-900 mb-1">
            Você ainda não fez nenhum pedido
          </h3>
          <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-xs max-w-sm mx-auto mb-6">
            Explore o nosso cardápio recheado com os melhores smash burgers e combos artesanais de São Paulo!
          </p>
          <button
            onClick={onBack}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            Fazer Meu Primeiro Pedido
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isExpanded = expandedOrderId === order.id;
            const canCancel = order.status === 'recebido' || order.status === 'em_preparo';
            const isCancelled = order.status === 'cancelado';

            return (
              <div
                key={order.id}
                className={`bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
                  highlightOrderId === order.id
                    ? 'border-red-500 ring-2 ring-red-500/30'
                    : 'border-zinc-800 dark:border-zinc-800 light:border-zinc-200'
                }`}
              >
                {/* Order Top Bar */}
                <div 
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-100 flex items-center justify-center text-2xl shrink-0">
                      🍔
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white dark:text-white light:text-zinc-900">
                          Pedido #{order.id}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} &bull; {order.items.reduce((s, i) => s + i.quantity, 0)} itens
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                        Total
                      </span>
                      <span className="text-lg font-black text-red-500">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button className="p-2 text-zinc-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Status Progress Visual Timeline */}
                {order.status !== 'cancelado' && (
                  <div className="px-5 sm:px-6 pb-4">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-semibold mb-2">
                      <span className={badge.step >= 1 ? 'text-red-500 font-bold' : 'text-zinc-500'}>
                        1. Recebido
                      </span>
                      <span className={badge.step >= 2 ? 'text-red-500 font-bold' : 'text-zinc-500'}>
                        2. Na Chapa
                      </span>
                      <span className={badge.step >= 3 ? 'text-red-500 font-bold' : 'text-zinc-500'}>
                        3. A Caminho
                      </span>
                      <span className={badge.step >= 4 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                        4. Entregue
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-600 via-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            order.status === 'recebido'
                              ? 25
                              : order.status === 'em_preparo'
                              ? 50
                              : order.status === 'saiu_entrega'
                              ? 75
                              : 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-zinc-800/80 dark:border-zinc-800/80 light:border-zinc-100 space-y-4">
                    
                    {/* Items List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                        Itens Solicitados
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs bg-zinc-800/40 dark:bg-zinc-800/40 light:bg-zinc-100 p-2.5 rounded-xl">
                            <div>
                              <span className="font-extrabold text-white dark:text-white light:text-zinc-900">
                                {item.quantity}x {item.title}
                              </span>
                              {item.extras && item.extras.length > 0 && (
                                <p className="text-[11px] text-zinc-400">
                                  + {item.extras.join(', ')}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-[11px] text-amber-400 italic">
                                  Obs: {item.notes}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-800/20 dark:bg-zinc-800/20 light:bg-zinc-50 p-3 rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
                      <div>
                        <span className="text-zinc-500 font-bold block mb-1">
                          Endereço / Modalidade:
                        </span>
                        <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-medium">
                          {order.address}
                        </p>
                      </div>

                      <div>
                        <span className="text-zinc-500 font-bold block mb-1">
                          Pagamento & Contato:
                        </span>
                        <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700 font-medium capitalize">
                          {order.paymentMethod} {order.changeFor ? `(Troco para ${order.changeFor})` : ''}
                        </p>
                        <p className="text-zinc-400 text-[11px]">
                          WhatsApp: {order.customerPhone}
                        </p>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openWhatsAppContact(order)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-600/30 px-3.5 py-2 rounded-xl transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Falar sobre o pedido no WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleRepeatOrder(order)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 rounded-xl transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pedir Novamente</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-600/30 px-3 py-2 rounded-xl transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancelar Pedido</span>
                          </button>
                        )}

                        {isCancelled && (
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-400 p-2 transition-colors"
                            title="Remover do histórico"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Remover</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
