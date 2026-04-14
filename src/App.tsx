import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Search, Menu as MenuIcon, X, ChevronRight, Plus, Minus, MessageCircle, PlusCircle, User, Edit2, Trash2, Settings, Lock, ArrowLeft } from 'lucide-react';
import { CATEGORIES, MENU_ITEMS, WHATSAPP_NUMBER } from './constants';
import { CartItem, MenuItem } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pier_gourmet_cart') : null;
    return saved ? JSON.parse(saved) : [];
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('pier_gourmet_cart', JSON.stringify(cart));
  }, [cart]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);
  const [view, setView] = useState<'catalog' | 'admin'>('catalog');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('pier_gourmet_customer_name') || '' : '';
  });

  // Save customer name to localStorage
  useEffect(() => {
    localStorage.setItem('pier_gourmet_customer_name', customerName);
  }, [customerName]);
  
  // Dynamic menu items state with persistence
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pier_gourmet_menu') : null;
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  // Save to localStorage whenever menuItems change
  useEffect(() => {
    localStorage.setItem('pier_gourmet_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES.find(c => c.id !== 'all')?.id || CATEGORIES[0].id,
    image: ''
  });

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, menuItems]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing?.quantity === 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryImages: Record<string, string> = {
      burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
      pastries: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
      portions: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=800&auto=format&fit=crop',
      drinks: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
      desserts: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop'
    };

    const product: MenuItem = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image || categoryImages[newProduct.category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'
    };
    setMenuItems(prev => [...prev, product]);
    setActiveCategory(newProduct.category);
    setSearchQuery('');
    setIsRegisterOpen(false);
    setNewProduct({ name: '', description: '', price: '', category: CATEGORIES.find(c => c.id !== 'all')?.id || CATEGORIES[0].id, image: '' });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedProduct: MenuItem = {
      ...editingProduct,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image || editingProduct.image
    };

    setMenuItems(prev => prev.map(item => item.id === editingProduct.id ? updatedProduct : item));
    setEditingProduct(null);
    setNewProduct({ name: '', description: '', price: '', category: CATEGORIES.find(c => c.id !== 'all')?.id || CATEGORIES[0].id, image: '' });
  };

  const handleDeleteProduct = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));
    setProductToDelete(null);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingProduct(item);
    setNewProduct({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const sendWhatsAppOrder = () => {
    if (!customerName.trim()) return;
    const itemsList = cart.map(item => `*${item.quantity}x* ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const message = `*PEDIDO PIER GOURMET*\n\n*Cliente:* ${customerName}\n\n*Itens:*\n${itemsList}\n\n*Total: R$ ${cartTotal.toFixed(2)}*`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleAdminAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'pier.adm') {
      setIsAdminAuthenticated(true);
      setShowPasswordPrompt(false);
      setView('admin');
      setAdminPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-bottom border-zinc-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-baseline font-display font-black text-2xl tracking-tighter italic">
              <span className="text-white">PI</span>
              <div className="flex flex-col gap-[2px] mx-[2px] translate-y-[-2px]">
                <div className="w-5 h-[5px] bg-pier-teal"></div>
                <div className="w-5 h-[5px] bg-pier-teal"></div>
                <div className="w-5 h-[5px] bg-pier-teal"></div>
              </div>
              <span className="text-white">R</span>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-zinc-800 mx-2"></div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-lg tracking-tight leading-none">GOURMET</h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-medium mt-1">Sabor que conecta</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {view === 'catalog' ? (
              <button 
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setView('admin');
                  } else {
                    setShowPasswordPrompt(true);
                  }
                }}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-pier-teal flex items-center gap-2"
                title="Gerenciamento"
              >
                <Settings className="w-6 h-6" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Painel</span>
              </button>
            ) : (
              <button 
                onClick={() => setView('catalog')}
                className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-pier-teal flex items-center gap-2"
                title="Voltar ao Catálogo"
              >
                <ArrowLeft className="w-6 h-6" />
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Catálogo</span>
              </button>
            )}
            
            {view === 'catalog' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-zinc-900 rounded-full transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pier-teal text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-8">
        {view === 'catalog' ? (
          <>
            {/* Hero / Search */}
            <section className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="O que você deseja saborear hoje?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pier-teal/50 transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex-none px-6 py-3 rounded-xl font-medium transition-all border",
                      activeCategory === cat.id 
                        ? "bg-pier-teal border-pier-teal text-white shadow-lg shadow-pier-teal/20" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Menu Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-pier-teal/50 transition-all"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-800">
                        <span className="text-pier-teal font-bold">R$ {item.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-lg group-hover:text-pier-teal transition-colors">{item.name}</h3>
                        <p className="text-zinc-500 text-sm line-clamp-2 mt-1">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-full bg-zinc-800 hover:bg-pier-teal text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                      >
                        <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                        Adicionar ao Pedido
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>

            {filteredItems.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-zinc-500">Nenhum item encontrado nesta categoria.</p>
              </div>
            )}
          </>
        ) : (
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-3xl">Gerenciamento</h2>
                <p className="text-zinc-500">Administre os produtos do catálogo</p>
              </div>
              <button 
                onClick={() => setIsRegisterOpen(true)}
                className="bg-pier-teal hover:bg-pier-teal/90 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-pier-teal/20"
              >
                <PlusCircle className="w-5 h-5" />
                Cadastrar Novo Produto
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Produto</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Preço</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-lg object-cover flex-none"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-zinc-500 text-xs line-clamp-1">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-2 py-1 bg-zinc-800 rounded-md text-zinc-400">
                            {CATEGORIES.find(c => c.id === item.category)?.name || item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-sm text-pier-teal">
                          R$ {item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(item)}
                              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-pier-teal transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setProductToDelete(item)}
                              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer Info */}
      <footer className="bg-zinc-900/50 border-t border-zinc-800 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h4 className="font-display font-bold text-lg">Sobre o Pier</h4>
            <p className="text-zinc-500 text-sm">O Pier Gourmet é o espaço gastronômico da nossa igreja, focado em excelência e comunhão através da boa comida.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-display font-bold text-lg">Funcionamento</h4>
            <p className="text-zinc-500 text-sm">Redes / Conferências / Pier Camp</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-display font-bold text-lg">Localização</h4>
            <p className="text-zinc-500 text-sm">Casa de Paternidade</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-xs">© 2024 Pier Gourmet. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Floating Cart Button (Mobile) */}
      {cartCount > 0 && !isCartOpen && (
        <motion.button
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-pier-teal text-white p-4 rounded-2xl shadow-2xl shadow-pier-teal/40 flex items-center gap-3 md:hidden"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="font-bold">Ver Pedido ({cartCount})</span>
        </motion.button>
      )}

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-pier-teal" />
                  <h2 className="font-display font-bold text-xl">Seu Pedido</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500">Seu carrinho está vazio.<br />Adicione algo delicioso!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Customer Name Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                        <User className="w-3 h-3" /> Seu Nome
                      </label>
                      <input 
                        type="text" 
                        placeholder="Como podemos te chamar?"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pier-teal transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 rounded-2xl object-cover flex-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm leading-tight">{item.name}</h4>
                              <span className="font-bold text-pier-teal text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-zinc-400 text-sm">
                      <span>Subtotal</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={sendWhatsAppOrder}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg",
                      customerName.trim() 
                        ? "bg-pier-teal hover:bg-pier-teal/90 text-white shadow-pier-teal/20" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    )}
                  >
                    <MessageCircle className="w-6 h-6" />
                    Finalizar no WhatsApp
                  </button>
                  <p className="text-[10px] text-center text-zinc-500 uppercase tracking-wider">
                    {customerName.trim() 
                      ? "Você será redirecionado para o WhatsApp." 
                      : "Informe seu nome acima para habilitar o botão."}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Registration/Edit Modal */}
      <AnimatePresence>
        {(isRegisterOpen || editingProduct) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsRegisterOpen(false); setEditingProduct(null); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl z-[70] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
                </h2>
                <button 
                  onClick={() => { setIsRegisterOpen(false); setEditingProduct(null); }} 
                  className="p-2 hover:bg-zinc-800 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={editingProduct ? handleUpdateProduct : handleRegisterProduct} className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Nome do Produto</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-pier-teal outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Descrição</label>
                  <textarea 
                    required
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-pier-teal outline-none h-24 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Preço (R$)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-pier-teal outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</label>
                    <select 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-pier-teal outline-none appearance-none"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">URL da Imagem (Opcional)</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    value={newProduct.image}
                    onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:ring-1 focus:ring-pier-teal outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-pier-teal hover:bg-pier-teal/90 text-white py-4 rounded-2xl font-bold transition-all mt-4 shadow-lg shadow-pier-teal/20"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Salvar Produto'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Password Prompt Modal */}
      <AnimatePresence>
        {showPasswordPrompt && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordPrompt(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl z-[110] shadow-2xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-pier-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-pier-teal" />
                </div>
                <h2 className="font-display font-bold text-2xl">Acesso Restrito</h2>
                <p className="text-zinc-500 text-sm">Informe a senha de administrador para acessar o painel.</p>
              </div>

              <form onSubmit={handleAdminAccess} className="space-y-4">
                <div className="space-y-2">
                  <input 
                    autoFocus
                    type="password" 
                    placeholder="Senha de acesso"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError(false);
                    }}
                    className={cn(
                      "w-full bg-zinc-950 border rounded-xl py-4 px-4 focus:outline-none focus:ring-2 transition-all text-center tracking-widest",
                      passwordError 
                        ? "border-red-500 focus:ring-red-500/50" 
                        : "border-zinc-800 focus:ring-pier-teal/50"
                    )}
                  />
                  {passwordError && (
                    <p className="text-red-500 text-[10px] text-center font-bold uppercase tracking-wider">Senha incorreta. Tente novamente.</p>
                  )}
                </div>
                <button 
                  type="submit"
                  className="w-full bg-pier-teal hover:bg-pier-teal/90 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-pier-teal/20"
                >
                  Entrar no Painel
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  className="w-full text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors"
                >
                  Cancelar
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl z-[130] shadow-2xl p-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="font-display font-bold text-2xl">Excluir Produto?</h2>
                <p className="text-zinc-500 text-sm">
                  Tem certeza que deseja excluir <span className="text-white font-bold">{productToDelete.name}</span>? Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDeleteProduct(productToDelete.id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Sim, Excluir
                </button>
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="w-full text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors py-2"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
