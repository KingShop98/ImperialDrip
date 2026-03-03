import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle, CreditCard, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Inicializar Stripe con la clave pública
const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

function CheckoutForm({ total, onPaymentSuccess, onPaymentError }: { total: number, onPaymentSuccess: () => void, onPaymentError: (error: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/checkout?success=true`,
      },
      redirect: 'if_required',
    });

    if (error) {
      onPaymentError(error.message || 'Error al procesar el pago');
      setIsProcessing(false);
    } else {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
        <p className="text-sm text-gray-300 mb-4">
          Selecciona tu método de pago preferido. Las opciones como Apple Pay o Google Pay aparecerán automáticamente si tu dispositivo es compatible.
        </p>
        <PaymentElement options={{ 
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: true
          },
          paymentMethodOrder: ['card', 'klarna', 'apple_pay', 'google_pay']
        }} />
      </div>
      <button 
        disabled={!stripe || isProcessing}
        className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 ${(!stripe || isProcessing) ? 'bg-yellow-500/50 text-black/50 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <ShoppingBag size={20} />
            <span>Pagar €{total.toFixed(2)}</span>
          </>
        )}
      </button>
    </form>
  );
}

export function Checkout() {
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    province: ''
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;

  useEffect(() => {
    if (step === 2 && paymentMethod === 'card' && total > 0) {
      // Create PaymentIntent as soon as the page loads
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [step, paymentMethod, total, cart]);

  if (cart.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateDiscount = async () => {
    if (!discountCode) return;
    
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setDiscountPercent(data.discount_percentage);
        setDiscountError('');
      } else {
        setDiscountError(data.error || 'Código inválido');
        setDiscountPercent(0);
      }
    } catch (err) {
      setDiscountError('Error al validar código');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const processOrder = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.product.id,
            variant_id: item.variant.id,
            quantity: item.quantity,
            price: item.product.price
          })),
          address: `${formData.address}, ${formData.zip} ${formData.city}, ${formData.province}`,
          contact: formData.phone,
          email: formData.email,
          total: total,
          discountCode: discountPercent > 0 ? discountCode : null
        })
      });
      
      if (res.ok) {
        setOrderComplete(true);
        clearCart();
      } else {
        alert('Error al procesar el pedido');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handlePaymentSuccess = () => {
    processOrder();
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleCheckout = async () => {
    if (paymentMethod === 'card') {
      // El pago con tarjeta se maneja dentro de CheckoutForm
      return;
    }

    setIsProcessing(true);
    // Para PayPal, simulamos el proceso por ahora
    setTimeout(() => {
      processOrder();
      setIsProcessing(false);
    }, 2000);
  };

  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-[#1a1a1a] rounded-3xl p-12 border border-white/5 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-8">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">¡Pedido Confirmado!</h1>
          <p className="text-gray-400 mb-8 text-lg">
            Gracias por tu compra, {formData.name}. Hemos enviado un correo a <span className="text-white font-medium">{formData.email}</span> con los detalles de tu pedido y la factura.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-yellow-500 mb-8">Finalizar compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold">1</div>
                <h2 className="text-2xl font-serif font-bold text-white">Datos de envío</h2>
              </div>
              
              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre completo *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Dirección completa *</label>
                  <input required type="text" name="address" placeholder="Calle, número, piso, puerta..." value={formData.address} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Código postal *</label>
                    <input required type="text" name="zip" value={formData.zip} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Ciudad *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Provincia *</label>
                    <input required type="text" name="province" value={formData.province} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                  </div>
                </div>
                
                <button type="submit" className="w-full py-4 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors mt-8">
                  Continuar al pago
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold">2</div>
                  <h2 className="text-2xl font-serif font-bold text-white">Método de pago</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-white flex items-center">
                  <ChevronLeft size={16} className="mr-1" /> Volver
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/10 bg-black/50 hover:border-white/30'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'card' ? 'border-yellow-500' : 'border-gray-500'}`}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 bg-yellow-500 rounded-full" />}
                  </div>
                  <CreditCard className="text-gray-400 mr-3" />
                  <span className="text-white font-medium">Tarjeta de crédito / débito</span>
                </label>
                
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/10 bg-black/50 hover:border-white/30'}`}>
                  <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${paymentMethod === 'paypal' ? 'border-yellow-500' : 'border-gray-500'}`}>
                    {paymentMethod === 'paypal' && <div className="w-3 h-3 bg-yellow-500 rounded-full" />}
                  </div>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 6.007 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.129 7.106z" fill="#003087"/>
                    <path d="M11.156 21.337H7.076l1.128-7.106c.083-.518.527-.9 1.051-.9h2.19c4.298 0 7.664-1.748 8.647-6.797.03-.15.054-.294.077-.437a7.212 7.212 0 0 1-.073.715c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.129 7.106z" fill="#0079C1"/>
                    <path d="M20.16 6.097c-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.129 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 6.007 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287z" fill="#00457C"/>
                  </svg>
                  <span className="text-white font-medium">PayPal</span>
                </label>
              </div>
              
              {paymentMethod === 'card' && clientSecret && (
                <div className="mb-8 p-4 bg-white rounded-xl">
                  <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                    <CheckoutForm total={total} onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} />
                  </Elements>
                  {paymentError && <div className="text-red-500 text-sm mt-4 text-center">{paymentError}</div>}
                </div>
              )}
              
              {paymentMethod === 'paypal' && (
                <>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-8 text-sm text-blue-200">
                    Serás redirigido a PayPal para completar tu compra de forma segura. El pago se realizará a la cuenta: <strong className="text-white">imperial.drip.contact@gmail.com</strong>
                  </div>
                  <button 
                    onClick={() => {
                      handleCheckout();
                      setTimeout(() => processOrder(), 2000); // Simulate PayPal redirect & return
                    }}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 ${isProcessing ? 'bg-yellow-500/50 text-black/50 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={20} />
                        <span>Pagar €{total.toFixed(2)} con PayPal</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5 sticky top-24">
            <h2 className="text-xl font-serif font-bold text-white mb-6">Resumen del pedido</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/5 rounded-lg p-2 flex-shrink-0 relative">
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain mix-blend-screen" />
                    <span className="absolute -top-2 -right-2 bg-gray-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-400 truncate">
                      {item.variant.color ? `${item.variant.color} / ` : ''}{item.variant.size_or_ml}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-white">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-6 mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Código de descuento</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Ej: IMPERIAL10" 
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 uppercase" 
                />
                <button 
                  onClick={validateDiscount}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  Aplicar
                </button>
              </div>
              {discountError && <p className="text-red-500 text-xs mt-2">{discountError}</p>}
              {discountPercent > 0 && <p className="text-green-500 text-xs mt-2">¡Descuento del {discountPercent}% aplicado!</p>}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Descuento ({discountPercent}%)</span>
                  <span>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Envío</span>
                <span className="text-green-500">Gratis</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-base font-medium text-white">Total</span>
                <span className="text-2xl font-bold text-yellow-500">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
