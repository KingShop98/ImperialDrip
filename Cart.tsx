import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ChevronLeft } from 'lucide-react';
import { useStore } from '../store';

export function Cart() {
  const cart = useStore(state => state.cart);
  const removeFromCart = useStore(state => state.removeFromCart);
  const updateQuantity = useStore(state => state.updateQuantity);
  const clearCart = useStore(state => state.clearCart);
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 text-center">
        <div className="bg-[#1a1a1a] rounded-3xl p-12 max-w-2xl mx-auto border border-white/5">
          <svg className="w-24 h-24 text-gray-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Tu cesta está vacía</h2>
          <p className="text-gray-400 mb-8">Parece que aún no has añadido ningún producto a tu cesta.</p>
          <Link to="/" className="inline-flex items-center space-x-2 bg-yellow-500 text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition-colors">
            <ChevronLeft size={20} />
            <span>Volver a la tienda</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold text-yellow-500">Tu cesta</h1>
        <button 
          onClick={clearCart}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Vaciar cesta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={`${item.product.id}-${item.variant.id}`} className="bg-[#1a1a1a] rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border border-white/5">
              <div className="w-32 h-32 bg-white/5 rounded-xl p-4 flex-shrink-0">
                <img 
                  src={item.product.image_url} 
                  alt={item.product.name} 
                  className="w-full h-full object-contain mix-blend-screen"
                />
              </div>
              
              <div className="flex-1 flex flex-col h-full w-full">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white">{item.product.name}</h3>
                    <p className="text-sm text-gray-400">
                      {item.variant.color ? `${item.variant.color} / ` : ''}
                      {item.variant.size_or_ml}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id, item.variant.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                <div className="mt-auto flex items-center justify-between w-full">
                  <div className="flex items-center bg-black/50 border border-white/10 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant.id, Math.max(1, item.quantity - 1))}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center text-white text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant.id, Math.min(item.variant.stock, item.quantity + 1))}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <span className="text-xl font-bold text-yellow-500">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5 sticky top-24">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Resumen</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span className="text-green-500">Gratis</span>
              </div>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-lg font-medium text-white">Total</span>
                <span className="text-3xl font-bold text-yellow-500">€{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                const user = useStore.getState().user;
                if (!user) {
                  navigate('/profile', { state: { returnTo: '/checkout' } });
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-4 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors mb-4"
            >
              Finalizar compra
            </button>
            
            <Link 
              to="/"
              className="w-full py-4 rounded-xl font-medium flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Seguir comprando</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
