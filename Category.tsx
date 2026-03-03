import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Product } from '../store';
import { Crown, ChevronRight } from 'lucide-react';

export function Category() {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        let filtered = data.filter((p: Product) => p.category.toLowerCase() === category?.toLowerCase());
        if (brandParam) {
          filtered = filtered.filter((p: Product) => p.brand.toLowerCase() === brandParam.toLowerCase());
        }
        setProducts(filtered);
        setLoading(false);
      });
  }, [category, brandParam]);

  const title = brandParam ? `${brandParam} ${category}` : category;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-yellow-500">Inicio</Link>
        <ChevronRight size={14} />
        <span className="capitalize">{category}</span>
        {brandParam && (
          <>
            <ChevronRight size={14} />
            <span className="capitalize text-white">{brandParam}</span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-yellow-500 capitalize mb-2">{title}</h1>
          <p className="text-gray-400">{products.length} productos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar en esta categoría..." 
              className="bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-yellow-500 w-64"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select className="bg-[#1a1a1a] border border-white/10 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-yellow-500 appearance-none">
            <option>Todos los precios</option>
            <option>Menos de 50€</option>
            <option>50€ - 100€</option>
            <option>Más de 100€</option>
          </select>
          
          <select className="bg-[#1a1a1a] border border-white/10 rounded-lg py-2 px-4 text-sm text-white focus:outline-none focus:border-yellow-500 appearance-none">
            <option>Destacados</option>
            <option>Precio: Menor a Mayor</option>
            <option>Precio: Mayor a Menor</option>
            <option>Novedades</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-white/5">
          <h3 className="text-xl text-white mb-2">No se encontraron productos</h3>
          <p className="text-gray-400">Intenta con otra búsqueda o categoría.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-white/5 p-6">
        {product.is_offer && (
          <span className="absolute top-4 left-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
            OFERTA
          </span>
        )}
        {product.is_featured && !product.is_offer && (
          <span className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full z-10">
            TOP
          </span>
        )}
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-screen group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-500 font-bold text-lg">€{product.price.toFixed(2)}</span>
          {product.original_price > product.price && (
            <span className="text-gray-500 line-through text-sm">€{product.original_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
