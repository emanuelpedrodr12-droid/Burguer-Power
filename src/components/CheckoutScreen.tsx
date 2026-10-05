import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle,
  Bike,
  Store,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseErrors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod, DeliveryType, Order, OrderItemSnapshot } from '../types';
import { HAMBURGUERIA_INFO } from '../data/mockProducts';

interface CheckoutScreenProps {
  onBack: () => void;
  onOrderSuccess: (orderId: string) => void;
  onOpenAuth: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  onBack,
  onOrderSuccess,
  onOpenAuth,
}) => {
  const { user, userProfile, updateUserContact } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    deliveryType,
    setDeliveryType,
    clearCart,
  } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState(
    user?.displayName || userProfile?.displayName || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    userProfile?.phone || ''
  );

  // Address fields
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardType, setCardType] = useState<'credito' | 'debito'>('credito');
  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Status flags
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyPix = () => {
    navigator.clipboard.writeText(HAMBURGUERIA_INFO.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setErrorMessage('Por favor, informe um WhatsApp válido com DDD (ex: 11987654321).');
      return false;
    }
    if (deliveryType === 'delivery') {
      if (!street.trim()) {
        setErrorMessage('Por favor, informe a Rua/Avenida de entrega.');
        return false;
      }
      if (!number.trim()) {
        setErrorMessage('Por favor, informe o número da residência.');
        return false;
      }
      if (!neighborhood.trim()) {
        setErrorMessage('Por favor, informe o Bairro.');
        return false;
      }
    }
    if (paymentMethod === 'dinheiro' && needChange && !changeFor.trim()) {
      setErrorMessage('Por favor, informe o valor para o troco.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleFinalizeOrder = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formattedAddress = deliveryType === 'delivery'
      ? `${street.trim()}, ${number.trim()} - ${neighborhood.trim()}${complement.trim() ? ` (${complement.trim()})` : ''}${reference.trim() ? ` - Ref: ${reference.trim()}` : ''}`
      : `Retirada no Balcão: ${HAMBURGUERIA_INFO.address}`;

    const orderId = `BP-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const orderItemSnapshots: OrderItemSnapshot[] = items.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      extras: item.selectedExtras.map((e) => `${e.name} (+R$ ${e.price.toFixed(2).replace('.', ',')})`),
      notes: item.notes || '',
    }));

    const paymentDescription = paymentMethod === 'pix'
      ? 'PIX (Chave copiada)'
      : paymentMethod === 'cartao'
        ? `Cartão de ${cardType === 'credito' ? 'Crédito' : 'Débito'} na Entrega`
        : `Dinheiro ${needChange ? `(Troco para R$ ${changeFor})` : '(Sem troco)'}`;

    const orderData: Order = {
      id: orderId,
      userId: user.uid,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      address: formattedAddress,
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' && needChange ? changeFor : '',
      items: orderItemSnapshots,
      subtotal,
      deliveryFee,
      total,
      status: 'recebido',
      notes: orderNotes.trim(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      // 1. Save order to Firestore with RLS
      await setDoc(doc(db, 'orders', orderId), orderData);

      // 2. Save customer info for future autofill
      updateUserContact(customerPhone.trim(), formattedAddress);

      // 3. Format message for WhatsApp
      let whatsappText = `🍔 *NOVO PEDIDO - BURGUER POWER* 🍔\n`;
      whatsappText += `*Código do Pedido:* #${orderId}\n`;
      whatsappText += `*Data/Hora:* ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n`;
      whatsappText += `👤 *CLIENTE:*\n`;
      whatsappText += `• Nome: ${customerName}\n`;
      whatsappText += `• WhatsApp: ${customerPhone}\n\n`;
      whatsappText += `🛵 *MODALIDADE DE ENTREGA:*\n`;
      whatsappText += `• ${deliveryType === 'delivery' ? 'Delivery em Domicílio' : 'Retirada no Balcão'}\n`;
      whatsappText += `• Endereço: ${formattedAddress}\n\n`;
      whatsappText += `📋 *ITENS DO PEDIDO:*\n`;

      items.forEach((item, index) => {
        whatsappText += `*${item.quantity}x ${item.product.title}* - R$ ${item.itemTotal.toFixed(2).replace('.', ',')}\n`;
        if (item.selectedExtras.length > 0) {
          whatsappText += `   + Adicionais: ${item.selectedExtras.map(e => e.name).join(', ')}\n`;
        }
        if (item.notes) {
          whatsappText += `   Obs: _${item.notes}_\n`;
        }
      });

      whatsappText += `\n💰 *VALORES:*\n`;
      whatsappText += `• Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
      whatsappText += `• Taxa de Entrega: ${deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}\n`;
      whatsappText += `🔥 *TOTAL: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
      whatsappText += `💳 *FORMA DE PAGAMENTO:*\n• ${paymentDescription}\n`;

      if (orderNotes.trim()) {
        whatsappText += `\n💬 *Observações Gerais:* ${orderNotes.trim()}\n`;
      }

      whatsappText += `\n_Pedido registrado automaticamente pelo App Cardápio Burguer Power!_`;

      // 4. Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E50914', '#FFAA00', '#FFFFFF'],
        });
      } catch {
        // confetti fallback
      }

      // 5. Open WhatsApp directly to burger owner
      const whatsappUrl = `https://wa.me/${HAMBURGUERIA_INFO.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, '_blank');

      // 6. Clear shopping cart and redirect
      clearCart();
      onOrderSuccess(orderId);
    } catch (err: unknown) {
      console.error('Error saving order:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
      } catch (e: unknown) {
        setErrorMessage('Não foi possível registrar o pedido no servidor. Por favor, tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 text-sm font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Cardápio</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-white dark:text-white light:text-zinc-900 tracking-tight">
          Confirmação de Pedido
        </h1>
        <p className="text-zinc-400 dark:text-zinc-400 light:text-zinc-600 text-sm mt-1">
          Revise seus dados, escolha como pagar e envie diretamente para o WhatsApp da Burguer Power.
        </p>
      </div>

      {/* Auth Prompt if not logged in */}
      {!user && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-xs sm:text-sm text-amber-200">
              Faça login ou cadastre-se para salvar e acompanhar o status do seu pedido em tempo real.
            </span>
          </div>
          <button
            onClick={onOpenAuth}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl shrink-0 transition-colors"
          >
            Entrar / Criar Conta
          </button>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-600/15 border border-red-500/40 text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Details, Address, Payment (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Customer Contact */}
          <div className="bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white p-5 sm:p-6 rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-zinc-900">
                1. Seus Dados de Contato
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ex: 11987654321"
                  className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery vs Pickup */}
          <div className="bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white p-5 sm:p-6 rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-zinc-900">
                2. Entrega ou Retirada
              </h2>
            </div>

            {/* Toggle Delivery / Retirada */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                    : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span>Delivery (Entregar)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('retirada')}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                  deliveryType === 'retirada'
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                    : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retirar no Balcão</span>
              </button>
            </div>

            {deliveryType === 'delivery' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                      Rua / Avenida *
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Rua das Flores"
                      className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 450"
                      className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Bela Vista"
                      className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                      Complemento (Apto, Bloco)
                    </label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Ex: Apto 42 Bloco B"
                      className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Em frente à padaria São Jorge"
                    className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 border border-zinc-700/60 dark:border-zinc-700/60 light:border-zinc-200 text-xs sm:text-sm">
                <div className="font-bold text-white dark:text-white light:text-zinc-900 mb-1 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-red-500" />
                  <span>Endereço de Retirada:</span>
                </div>
                <p className="text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                  {HAMBURGUERIA_INFO.address}
                </p>
                <div className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tempo estimado para retirada: 20 a 30 minutos após confirmação.</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div className="bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white p-5 sm:p-6 rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-zinc-900">
                3. Forma de Pagamento
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold gap-1.5 transition-all ${
                  paymentMethod === 'pix'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-700 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>PIX</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold gap-1.5 transition-all ${
                  paymentMethod === 'cartao'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-700 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold gap-1.5 transition-all ${
                  paymentMethod === 'dinheiro'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-700 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Dinheiro</span>
              </button>
            </div>

            {/* PIX Details */}
            {paymentMethod === 'pix' && (
              <div className="p-4 rounded-2xl bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 border border-zinc-700/60 dark:border-zinc-700/60 light:border-zinc-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300 dark:text-zinc-300 light:text-zinc-700">
                    Chave PIX Oficial ({HAMBURGUERIA_INFO.pixKeyType}):
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold">Aprovação imediata</span>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-900 light:bg-white p-2.5 rounded-xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300">
                  <span className="text-xs font-mono text-white dark:text-white light:text-zinc-900 truncate flex-1 select-all">
                    {HAMBURGUERIA_INFO.pixKey}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedPix ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Chave</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-500 mt-2">
                  Favorecido: <strong>{HAMBURGUERIA_INFO.pixReceiverName}</strong>. Envie o comprovante no WhatsApp ao finalizar.
                </p>
              </div>
            )}

            {/* Card Details */}
            {paymentMethod === 'cartao' && (
              <div className="space-y-3">
                <span className="block text-xs font-bold text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
                  Tipo de Cartão na Maquininha:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType('credito')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      cardType === 'credito'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                    }`}
                  >
                    Cartão de Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('debito')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      cardType === 'debito'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-zinc-800/60 dark:bg-zinc-800/60 light:bg-zinc-100 text-zinc-400 dark:text-zinc-400 light:text-zinc-600 border-zinc-700 dark:border-zinc-700 light:border-zinc-300'
                    }`}
                  >
                    Cartão de Débito
                  </button>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-500">
                  O entregador levará a máquina até você. Aceitamos Visa, Mastercard, Elo, Alelo e VR.
                </p>
              </div>
            )}

            {/* Cash Details */}
            {paymentMethod === 'dinheiro' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="needChange"
                    checked={needChange}
                    onChange={(e) => setNeedChange(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 bg-zinc-800 border-zinc-700 focus:ring-red-500"
                  />
                  <label htmlFor="needChange" className="text-xs sm:text-sm font-semibold text-zinc-200 dark:text-zinc-200 light:text-zinc-800 cursor-pointer">
                    Preciso de troco em dinheiro
                  </label>
                </div>

                {needChange && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-1.5">
                      Troco para quanto? *
                    </label>
                    <input
                      type="text"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      placeholder="Ex: R$ 50,00 ou R$ 100,00"
                      className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm px-4 py-3 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observations */}
          <div className="bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white p-5 sm:p-6 rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400 light:text-zinc-600 mb-2">
              Observações Gerais do Pedido (Opcional)
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Ex: Tocar o interfone 202, enviar guardanapos extras, maionese à parte..."
              rows={2}
              className="w-full bg-zinc-800/80 dark:bg-zinc-800/80 light:bg-zinc-100 text-white dark:text-white light:text-zinc-900 text-sm p-3.5 rounded-2xl border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

        </div>

        {/* Right Column: Order Summary & WhatsApp Action */}
        <div className="space-y-6">
          <div className="bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white p-6 rounded-3xl border border-zinc-800 dark:border-zinc-800 light:border-zinc-200 shadow-xl sticky top-24">
            <h3 className="text-base font-extrabold text-white dark:text-white light:text-zinc-900 mb-4 pb-3 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-200">
              Resumo do Pedido ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="text-xs flex justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-white dark:text-white light:text-zinc-900">
                      {item.quantity}x {item.product.title}
                    </span>
                    {item.selectedExtras.length > 0 && (
                      <div className="text-[10px] text-zinc-400 truncate">
                        +{item.selectedExtras.map(e => e.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-zinc-300 dark:text-zinc-300 light:text-zinc-700 shrink-0">
                    R$ {item.itemTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 pt-3 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-xs text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white dark:text-white light:text-zinc-900">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Taxa de Entrega</span>
                <span className="font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-bold">Grátis</span>
                  ) : (
                    `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                  )}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 text-base font-black text-white dark:text-white light:text-zinc-900">
                <span>Total a Pagar</span>
                <span className="text-red-500 text-xl font-black">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* WhatsApp Big CTA Button */}
            <button
              onClick={handleFinalizeOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black py-4 px-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex flex-col items-center justify-center gap-1 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'Processando Pedido...' : 'Enviar Pedido para WhatsApp'}</span>
              </div>
              <span className="text-[10px] text-emerald-100 font-medium">
                Salva em tempo real e abre o WhatsApp oficial
              </span>
            </button>

            <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-500 light:text-zinc-400 mt-3 leading-tight">
              Ao enviar, você receberá a confirmação e poderá acompanhar o preparo do seu pedido em tempo real.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
