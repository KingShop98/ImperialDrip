import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, ChevronRight } from 'lucide-react';
import { Product } from '../store';
import { motion } from 'motion/react';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const featuredProducts = products.filter(p => p.is_featured);
  const offerProducts = products.filter(p => p.is_offer);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#111111] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=2000" 
            alt="Air Force 1" 
            className="w-full h-full object-cover object-center opacity-50"
          />
        </div>
        
        <div className="relative z-20 text-center px-4 flex flex-col items-center">
          <Crown size={48} className="text-yellow-500 mb-6" />
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-4 tracking-tight relative inline-block pb-4">
            <span className="text-yellow-500">Imperial Drip</span>
            <span 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent bg-[length:200%_100%] animate-shimmer pb-4"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }}
            >
              Imperial Drip
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white font-light italic mb-12">
            Viste como un rey
          </p>
          
          <div className="w-full max-w-md relative mb-8">
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-12 pr-6 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <Link to="/category/zapatillas" className="group flex items-center space-x-2 bg-yellow-500 text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-400 transition-colors">
            <span>Explorar colección</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Más Vendidos */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-white flex items-center space-x-3">
              <span className="bg-yellow-500 text-black p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </span>
              <span>Más Vendidos</span>
            </h2>
            <p className="text-gray-400 mt-2">Los favoritos de nuestros clientes</p>
          </div>
          <Link to="/category/zapatillas" className="text-yellow-500 hover:text-yellow-400 flex items-center text-sm font-medium">
            Ver todo <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Banner Envío */}
      <section className="bg-purple-900 py-12 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Envío Gratis en toda España</h2>
        <p className="text-purple-200 text-lg">En todos los pedidos sin mínimo de compra</p>
      </section>

      {/* Ofertas Especiales */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-white flex items-center space-x-3">
              <span className="bg-purple-600 text-white p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </span>
              <span>Ofertas Especiales</span>
            </h2>
            <p className="text-gray-400 mt-2">Aprovecha estos descuentos únicos</p>
          </div>
          <Link to="/category/zapatillas" className="text-purple-400 hover:text-purple-300 flex items-center text-sm font-medium">
            Ver todo <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {offerProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-serif font-bold text-yellow-500 text-center mb-12">Explora por Categorías</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CategoryCard 
            title="Zapatillas" 
            image="https://images.unsplash.com/photo-1552346154-21d32810baa3?auto=format&fit=crop&q=80&w=800"
            link="/category/zapatillas"
          />
          <CategoryCard 
            title="Ropa" 
            image="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800"
            link="/category/ropa"
          />
          <CategoryCard 
            title="Perfumes" 
            image="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"
            link="/category/perfumes"
          />
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-white/5 p-4">
        {product.is_offer && (
          <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
            OFERTA
          </span>
        )}
        {product.is_featured && !product.is_offer && (
          <span className="absolute top-3 left-3 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full z-10">
            TOP
          </span>
        )}
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="text-sm md:text-base font-medium text-white mb-2 line-clamp-2 flex-1">{product.name}</h3>
        <div className="flex items-center space-x-2 mt-auto">
          <span className="text-yellow-500 font-bold text-base md:text-lg">€{product.price.toFixed(2)}</span>
          {product.original_price > product.price && (
            <span className="text-gray-500 line-through text-xs md:text-sm">€{product.original_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategoryCard({ title, image, link }: { title: string, image: string, link: string }) {
  return (
    <Link to={link} className="group relative h-96 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
      <img 
        src={image} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
        <h3 className="text-4xl font-serif font-bold text-white mb-4">{title}</h3>
        <span className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          Ver productos
        </span>
      </div>
    </Link>
  );
}
