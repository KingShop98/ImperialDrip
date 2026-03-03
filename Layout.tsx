import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, User, X, ChevronRight, Crown } from 'lucide-react';
import { useStore } from '../store';

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-white/10 z-50 flex items-center justify-between px-4 md:px-8">
      <button onClick={onOpenSidebar} className="p-2 text-white hover:text-yellow-500 transition-colors">
        <Menu size={24} />
      </button>
      
      <Link to="/" className="flex flex-col items-center justify-center">
        <Crown size={20} className="text-yellow-500 mb-1" />
        <span className="text-xl font-serif font-bold text-yellow-500 tracking-wider">Imperial Drip</span>
      </Link>
      
      <div className="flex items-center space-x-4">
        <Link to="/profile" className="p-2 text-white hover:text-yellow-500 transition-colors">
          <User size={24} />
        </Link>
        <Link to="/cart" className="p-2 text-white hover:text-yellow-500 transition-colors relative">
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  const categories = [
    { name: 'Zapatillas', brands: ['Nike', 'Adidas', 'Jordan', 'Puma'] },
    { name: 'Ropa', brands: ['Nike', 'Adidas', 'Zara'] },
    { name: 'Perfumes', brands: ['Dior', 'Chanel', 'Versace'] },
  ];

  const handleBrandClick = (category: string, brand: string) => {
    onClose();
    navigate(`/category/${category.toLowerCase()}?brand=${brand}`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-[#111111] z-50 transform transition-transform duration-300 ease-in-out border-r border-white/10 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <Crown size={16} className="text-yellow-500" />
              <span className="text-lg font-serif font-bold text-yellow-500">Imperial Drip</span>
            </div>
            <span className="text-xs text-gray-400 italic">Viste como un rey</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <Link to="/" onClick={onClose} className="block px-6 py-3 text-white hover:bg-white/5 hover:text-yellow-500 transition-colors font-medium">
            Inicio
          </Link>
          
          {categories.map((cat) => (
            <div key={cat.name}>
              <button 
                onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                className="w-full flex items-center justify-between px-6 py-3 text-white hover:bg-white/5 hover:text-yellow-500 transition-colors font-medium"
              >
                {cat.name}
                <ChevronRight size={16} className={`transform transition-transform ${expandedCategory === cat.name ? 'rotate-90' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${expandedCategory === cat.name ? 'max-h-48' : 'max-h-0'}`}>
                <div className="bg-black/30 py-2">
                  {cat.brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandClick(cat.name, brand)}
                      className="w-full text-left px-10 py-2 text-sm text-gray-400 hover:text-yellow-500 hover:bg-white/5 transition-colors"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/contact" onClick={onClose} className="block px-6 py-3 text-white hover:bg-white/5 hover:text-yellow-500 transition-colors font-medium">
            Contacto
          </Link>
        </div>
        
        <div className="p-6 border-t border-white/10">
          {user ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Hola, {user.name}</p>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={onClose} className="block text-sm text-yellow-500 hover:underline">
                  Panel de Admin
                </Link>
              )}
              <Link to="/profile" onClick={onClose} className="block text-sm text-white hover:text-yellow-500">
                Mi perfil
              </Link>
            </div>
          ) : (
            <Link to="/profile" onClick={onClose} className="block text-sm text-white hover:text-yellow-500">
              Iniciar sesión / Registrarse
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 pt-12 pb-8 px-4 md:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Crown size={20} className="text-yellow-500" />
            <span className="text-xl font-serif font-bold text-yellow-500">Imperial Drip</span>
          </div>
          <p className="text-gray-400 text-sm italic">Viste como un rey</p>
        </div>
        
        <div>
          <h3 className="text-white font-medium mb-4">Categorías</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/category/zapatillas" className="hover:text-yellow-500 transition-colors">Zapatillas</Link></li>
            <li><Link to="/category/ropa" className="hover:text-yellow-500 transition-colors">Ropa</Link></li>
            <li><Link to="/category/perfumes" className="hover:text-yellow-500 transition-colors">Perfumes</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-medium mb-4">Ayuda</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/contact" className="hover:text-yellow-500 transition-colors">Contacto</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Imperial Drip. Todos los derechos reservados.
      </div>
    </footer>
  );
}
