import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, ShoppingBag, Check, Crown } from 'lucide-react';
import { useStore, Product, ProductVariant } from '../store';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const addToCart = useStore(state => state.addToCart);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl text-white mb-4">Producto no encontrado</h2>
        <Link to="/" className="text-yellow-500 hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    }
  };

  const isPerfume = product.category.toLowerCase() === 'perfumes';
  const sizeLabel = isPerfume ? 'Mililitros' : 'Talla';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-yellow-500">Inicio</Link>
        <ChevronRight size={14} />
        <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-yellow-500 capitalize">{product.category}</Link>
        <ChevronRight size={14} />
        <span className="text-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="bg-white/5 rounded-3xl p-8 flex items-center justify-center relative">
          {product.is_offer && (
            <span className="absolute top-6 left-6 bg-purple-600 text-white text-sm font-bold px-4 py-1.5 rounded-full z-10">
              OFERTA
            </span>
          )}
          {product.is_featured && !product.is_offer && (
            <span className="absolute top-6 left-6 bg-yellow-500 text-black text-sm font-bold px-4 py-1.5 rounded-full z-10">
              TOP
            </span>
          )}
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full max-w-md object-contain mix-blend-screen"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">{product.brand}</p>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">{product.name}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-3xl font-bold text-yellow-500">€{product.price.toFixed(2)}</span>
            {product.original_price > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">€{product.original_price.toFixed(2)}</span>
                <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded">
                  -{Math.round((1 - product.price / product.original_price) * 100)}%
                </span>
              </>
            )}
          </div>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            {product.description}
          </p>
          
          <div className="space-y-6 mb-8">
            {/* Size / ML Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">{sizeLabel}</label>
              <div className="grid grid-cols-4 gap-3">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'bg-yellow-500 text-black'
                        : variant.stock === 0
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                        : 'bg-[#1a1a1a] text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {variant.size_or_ml}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection (if not perfume) */}
            {!isPerfume && selectedVariant?.color && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">Color</label>
                <div className="text-white bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 inline-block">
                  {selectedVariant.color}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">Unidades</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center text-white font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {selectedVariant ? `${selectedVariant.stock} disponibles` : ''}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                added 
                  ? 'bg-green-500 text-white'
                  : !selectedVariant || selectedVariant.stock === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-black hover:bg-yellow-400'
              }`}
            >
              {added ? (
                <>
                  <Check size={20} />
                  <span>Añadido a la cesta</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  <span>Añadir a la cesta</span>
                </>
              )}
            </button>
            
            <Link 
              to="/cart"
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 bg-[#1a1a1a] text-white border border-white/10 hover:bg-white/5 transition-colors"
            >
              Ver cesta
            </Link>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <Crown size={18} className="text-yellow-500" />
              <span>Calidad Premium</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              <span>Envío Gratis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
