import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Users, MessageSquare, Settings, X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export function Admin() {
  const location = useLocation();
  const user = useStore(state => state.user);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
    { path: '/admin/productos', label: 'Productos', icon: Package },
    { path: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { path: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare },
    { path: '/admin/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-white/10 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-serif font-bold text-yellow-500 mb-8">Panel de Admin</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
                
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-yellow-500/10 text-yellow-500 font-medium' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Admin Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardStats />} />
          <Route path="/pedidos" element={<AdminOrders />} />
          <Route path="/productos" element={<AdminProducts />} />
          <Route path="/usuarios" element={<AdminUsers />} />
          <Route path="/mensajes" element={<AdminMessages />} />
          <Route path="/configuracion" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardStats() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, users: 0 });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <p className="text-gray-400 text-sm font-medium mb-2">Ingresos Totales</p>
          <p className="text-3xl font-bold text-yellow-500">€{stats.revenue.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <p className="text-gray-400 text-sm font-medium mb-2">Pedidos</p>
          <p className="text-3xl font-bold text-white">{stats.orders}</p>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <p className="text-gray-400 text-sm font-medium mb-2">Productos</p>
          <p className="text-3xl font-bold text-white">{stats.products}</p>
        </div>
        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
          <p className="text-gray-400 text-sm font-medium mb-2">Usuarios</p>
          <p className="text-3xl font-bold text-white">{stats.users}</p>
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-white mb-8">Pedidos</h1>
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-sm">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">#{order.id}</td>
                <td className="p-4 text-gray-300">{order.contact_number}</td>
                <td className="p-4 text-gray-300">{order.email}</td>
                <td className="p-4 text-yellow-500 font-medium">€{order.total.toFixed(2)}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No hay pedidos aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    brand: '',
    image_url: '',
    is_featured: false,
    is_offer: false,
    variants: [{ size_or_ml: '', color: '', stock: 10 }]
  });

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        original_price: product.original_price ? product.original_price.toString() : '',
        category: product.category,
        brand: product.brand,
        image_url: product.image_url,
        is_featured: Boolean(product.is_featured),
        is_offer: Boolean(product.is_offer),
        variants: product.variants && product.variants.length > 0 
          ? product.variants 
          : [{ size_or_ml: '', color: '', stock: 10 }]
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        category: '',
        brand: '',
        image_url: '',
        is_featured: false,
        is_offer: false,
        variants: [{ size_or_ml: '', color: '', stock: 10 }]
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size_or_ml: '', color: '', stock: 10 }]
    }));
  };

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null
        })
      });
      
      if (res.ok) {
        handleCloseModal();
        fetchProducts();
      } else {
        alert('Error al guardar el producto');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Error al eliminar el producto');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold text-white">Productos</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" /> Añadir Producto
        </button>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-sm">
              <th className="p-4 font-medium">Producto</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium">Marca</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center space-x-3">
                  <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded bg-white/5 object-contain" />
                  <span className="text-white font-medium">{product.name}</span>
                </td>
                <td className="p-4 text-gray-300">{product.category}</td>
                <td className="p-4 text-gray-300">{product.brand}</td>
                <td className="p-4 text-yellow-500 font-medium">€{product.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">No hay productos aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1a1a1a] rounded-3xl border border-white/10 w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-serif font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Añadir Producto'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nombre *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">URL de la imagen *</label>
                  <input required type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Descripción *</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Precio (€) *</label>
                  <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Precio Original (€)</label>
                  <input type="number" step="0.01" name="original_price" value={formData.original_price} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Categoría *</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500">
                    <option value="">Seleccionar...</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Zapatillas">Zapatillas</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Perfumes">Perfumes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Marca *</label>
                  <input required type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500" />
                </div>
              </div>

              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="w-5 h-5 rounded border-gray-400 text-yellow-500 focus:ring-yellow-500 bg-black/50" />
                  <span className="text-gray-300">Destacado</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="is_offer" checked={formData.is_offer} onChange={handleInputChange} className="w-5 h-5 rounded border-gray-400 text-yellow-500 focus:ring-yellow-500 bg-black/50" />
                  <span className="text-gray-300">En Oferta</span>
                </label>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Variantes (Tallas/Colores)</h3>
                  <button type="button" onClick={addVariant} className="text-sm text-yellow-500 hover:text-yellow-400 flex items-center">
                    <Plus size={16} className="mr-1" /> Añadir variante
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center space-x-4 bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="flex-1">
                        <input type="text" placeholder="Talla o ML (ej: M, 42, 100ml)" value={variant.size_or_ml} onChange={(e) => handleVariantChange(index, 'size_or_ml', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <input type="text" placeholder="Color (opcional)" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                      </div>
                      <div className="w-24">
                        <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" />
                      </div>
                      <button type="button" onClick={() => removeVariant(index)} className="text-gray-500 hover:text-red-500 p-2" disabled={formData.variants.length === 1}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                <button type="button" onClick={handleCloseModal} className="px-6 py-3 rounded-xl font-medium text-white hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-white mb-8">Usuarios</h1>
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-sm">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Rol</th>
              <th className="p-4 font-medium">Fecha de registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4 text-white">#{user.id}</td>
                <td className="p-4 text-gray-300">{user.name}</td>
                <td className="p-4 text-gray-300">{user.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch('/api/admin/messages')
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-white mb-8">Mensajes</h1>
      <div className="space-y-4">
        {messages.map((msg: any) => (
          <div key={msg.id} className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">{msg.name}</h3>
                <p className="text-sm text-gray-400">{msg.email} • {msg.phone}</p>
              </div>
              <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
            </div>
            <p className="text-gray-300 bg-black/30 p-4 rounded-xl border border-white/5">
              {msg.message}
            </p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-[#1a1a1a] rounded-2xl border border-white/5">
            No hay mensajes nuevos.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-white mb-8">Configuración</h1>
      <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/5">
        <p className="text-gray-400">Próximamente: Configuración de la tienda, métodos de pago, envíos, etc.</p>
      </div>
    </div>
  );
}
