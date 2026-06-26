import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, RotateCcw, AlertCircle, ShoppingBag, Check, ArrowRight, Plus, Minus } from 'lucide-react';
import { MenuItem, Category, CartItem, ViewType } from '../types';

interface MenuViewProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem, customizations?: Record<string, Record<string, number>>) => void;
  onUpdateCartQuantity: (itemId: string, dQuantity: number) => void;
  onNavigate: (view: ViewType) => void;
  menuItems: MenuItem[];
}

export default function MenuView({ cart, onAddToCart, onUpdateCartQuantity, onNavigate, menuItems }: MenuViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const categories: Category[] = ['All', 'Nigerian Meals', 'Fast Foods', 'Snacks', 'Drinks'];

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute live quantities per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menuItems.length };
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch; // Show all items, regardless of stock status
    });
  }, [menuItems, selectedCategory, searchQuery]);
  
  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, current) => acc + current.quantity, 0);
  }, [cart]);
  
  const customizationExtra = useCallback((ci: CartItem) => {
    if (!ci.customizations || !ci.item.customOptions) return 0;
  
    let totalExtra = 0;
    // ci.customizations is { optionId: { choiceValue: quantity } }
    for (const optionId in ci.customizations) {
      const selectedChoices = ci.customizations[optionId];
      const optionDetails = ci.item.customOptions.find(opt => opt.id === optionId);
      if (!optionDetails) continue;
  
      for (const choiceValue in selectedChoices) {
        const quantity = selectedChoices[choiceValue];
        const choiceDetails = optionDetails.choices.find(c => String(c.value) === String(choiceValue));
        if (choiceDetails && choiceDetails.price) {
          totalExtra += choiceDetails.price * quantity;
        }
      }
    }
    return totalExtra;
  }, []);

  const cartTotalValue = useMemo(() => {
    return cart.reduce((acc, current) => acc + (current.item.price + customizationExtra(current)) * current.quantity, 0);
  }, [cart, customizationExtra]);

  return (
    <div className="pt-24 pb-24 space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-brand-orange font-bold text-xs uppercase tracking-wider font-sans bg-orange-50 px-3 py-1 rounded-full">Explore Uni Kitchen Cuisine</span>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-[#1a1a1a] mt-1.5">Campus Foods Menu 😋</h1>
          <p className="text-sm font-sans text-gray-500 mt-1">Select from {menuItems.length} dishes prepared safely. Hygienic, hot, and delicious.</p>
        </div>

        {totalCartItems > 0 && (
          <button
            onClick={() => onNavigate('cart')}
            className="flex items-center gap-2 bg-[#fff6ea] border border-orange-300 text-brand-orange hover:bg-orange-100 font-sans font-bold px-4 py-2.5 rounded-full text-xs transition-colors cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>View Cart ({totalCartItems} items)</span>
          </button>
        )}
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-orange-100/80 shadow-md sticky top-16 md:top-[72px] z-20 transition-all duration-200">
        
        {/* Category horizontal pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 md:pb-0 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            const count = categoryCounts[category] || 0;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 font-sans font-bold text-xs tracking-wide px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-orange text-white shadow-lg shadow-orange-200/60 hover:scale-102'
                    : 'bg-[#fff9f1]/70 hover:bg-orange-50 text-gray-600'
                }`}
              >
                {category} <span className={`ml-1 text-[10px] font-semibold ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search meal or drink..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fff9f2]/40 hover:bg-[#fff9f2]/75 focus:bg-white text-sm font-sans font-semibold text-[#1a1a1a] placeholder-gray-400 pl-10 pr-4 py-3 rounded-2xl border border-orange-100/75 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all duration-200"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
        </div>

      </div>

      {/* ITEMS COUNT / STATUS AREA */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-sans">
        <div className="flex items-center gap-1">
          <SlidersHorizontal size={12} />
          <span>Showing <b>{filteredItems.length}</b> delicacies in <b>{selectedCategory}</b></span>
        </div>
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-brand-orange hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <RotateCcw size={11} /> Reset Filters
          </button>
        )}
      </div>

      {/* FOOD GRID */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-6 lg:gap-8 items-start">
          {filteredItems.map((item) => {
            const isCurrentlyAdding = addingId === item.id;
            const cartItem = cart.find(ci => ci.item.id === item.id && (!ci.customizations || Object.keys(ci.customizations).length === 0));
            return (
              <div
                key={item.id}
                className="self-start bg-white border border-orange-100/60 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-orange-200/25 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
              >
                {/* Image & tag */}
                <div className="relative h-44 overflow-hidden bg-[#fff2e0]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.popular && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase bg-white/95 text-brand-orange rounded-lg shadow-sm">
                      Popular
                    </span>
                  )}
                </div>

                {/* Info and Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-base text-brand-dark leading-tight group-hover:text-brand-orange transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 font-sans line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing and cart controls */}
                  <div className="flex flex-col gap-3 pt-3 mt-4 border-t border-orange-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">PRICE</span>
                        <span className="text-base font-display font-extrabold text-[#1a1a1a]">₦{item.price.toLocaleString()}</span>
                      </div>

                      {item.inStock !== false ? (
                        cartItem ? (
                          <div className="flex items-center bg-orange-50/50 border border-orange-100/50 rounded-2xl p-1 shrink-0">
                            <button
                              onClick={() => onUpdateCartQuantity(cartItem.cartId, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-gray-500 hover:text-brand-orange flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer select-none"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 text-xs font-bold font-sans text-brand-dark">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateCartQuantity(cartItem.cartId, 1)}
                              className="w-7 h-7 rounded-lg bg-white text-gray-500 hover:text-brand-orange flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer select-none"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onAddToCart(item);
                              setAddingId(item.id);
                              setTimeout(() => setAddingId(null), 1000);
                            }}
                            className={`py-2 px-4 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5 focus:outline-none ${
                              isCurrentlyAdding
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 scale-102 flex'
                                : 'bg-brand-orange hover:bg-[#e07f00] text-white shadow-orange-200 hover:scale-105'
                            }`}
                          >
                            {isCurrentlyAdding ? <Check size={13} className="stroke-[3] animate-bounce" /> : <ShoppingBag size={13} />}
                            {isCurrentlyAdding ? 'Added! ✓' : 'Add to Cart'}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="py-2 px-4 text-xs font-bold rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed shadow-md inline-flex items-center justify-center gap-1.5"
                        >
                          <AlertCircle size={13} /> Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty/No outcomes state */
        <div className="bg-white border border-orange-100/50 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-brand-orange mx-auto">
            <AlertCircle size={22} />
          </div>
          <h3 className="font-display font-bold text-lg text-[#1a1a1a]">No Food Items Found</h3>
          <p className="text-xs font-sans text-gray-500 leading-relaxed">
            No meals matching "{searchQuery}" could be located in the {selectedCategory} category. Try searching another term or choosing another pill filter!
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-white bg-brand-orange hover:bg-[#e07f00] font-sans font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow-md shadow-orange-200"
          >
            Show All Menu Items
          </button>
        </div>
      )}

      {/* Floating back-to-top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 w-11 h-11 bg-white hover:bg-orange-50 text-brand-orange border border-orange-100 rounded-full shadow-lg flex items-center justify-center transition-all hover:-translate-y-1 z-40 cursor-pointer text-xs"
          title="Back to Top"
        >
          ▲
        </button>
      )}

      {/* Floating Bottom Sticky Cart Summary Widget */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-lg bg-[#1a1a1a] text-white p-4 rounded-3xl shadow-2xl flex justify-between items-center z-50 animate-slideUp font-sans">
          <div className="flex items-center gap-3">
            <div className="bg-brand-orange text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm relative">
              {totalCartItems}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Your Basket</p>
              <p className="text-sm font-extrabold font-display leading-none">₦{cartTotalValue.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onNavigate('cart');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <span>Checkout Basket 💳</span>
            <ArrowRight size={13} className="stroke-[2.5]" />
          </button>
        </div>
      )}

    </div>
  );
}
