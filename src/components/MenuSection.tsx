import React from 'react';
import { 
  Search, 
  Heart, 
  Settings, 
  Minus, 
  Plus, 
  Frown 
} from 'lucide-react';
import { MenuItem } from '../types';

interface MenuSectionProps {
  filteredMenu: MenuItem[];
  categories: string[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  cardQuantities: Record<string, number>;
  favoriteMealIds: string[];
  toggleFavoriteMeal: (mealId: string) => void;
  showCustomizerModal: (item: MenuItem) => void;
  adjustCardPortionQty: (mealId: string, change: number) => void;
  addCardItemToCart: (item: MenuItem) => void;
}

export default function MenuSection({
  filteredMenu,
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  cardQuantities,
  favoriteMealIds,
  toggleFavoriteMeal,
  showCustomizerModal,
  adjustCardPortionQty,
  addCardItemToCart
}: MenuSectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Authentic Menu</h1>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold">Delicious campus food delights curated daily for students & staff.</p>
      </div>

      {/* Sorting, filtering, and query block */}
      <div className="bg-white border border-slate-250 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Query search input */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-3 text-slate-400 w-4.5 h-4.5" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for Jollof, indomie..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition font-sans font-medium" 
          />
        </div>

        {/* Category tags row */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer border border-solid ${selectedCategory === cat ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting triggers */}
        <div className="w-full md:w-44 shrink-0">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
          >
            <option value="default">Sort: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Menu Items Catalog Grid row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenu.length > 0 ? (
          filteredMenu.map(meal => {
            const currentQty = cardQuantities[meal.id] || 1;
            return (
              <div 
                key={meal.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative"
              >
                <div>
                  <div className="h-44 bg-slate-100 relative max-h-44 overflow-hidden">
                    <img src={meal.image} alt={meal.name} className={`w-full h-full object-cover transition duration-300 ${meal.available === false ? 'grayscale filter blur-2xs brightness-75' : ''}`} />
                    {meal.available === false && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border border-red-400 border-solid shadow-sm animate-pulse">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMeal(meal.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm border border-slate-100 hover:bg-white transition cursor-pointer text-rose-500 hover:scale-105 active:scale-95 border-solid bg-transparent"
                      title={favoriteMealIds.includes(meal.id) ? "Remove Favorite" : "Add to Favorites"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favoriteMealIds.includes(meal.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  </div>
                  <div className="p-4.5 space-y-1.5 bg-white">
                    <span className="inline-block bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase">
                      {meal.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{meal.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">{meal.description}</p>
                  </div>
                </div>

                <div className="p-4.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="font-black text-slate-900 text-lg">₦{meal.price}</span>
                  {meal.available === false ? (
                    <button 
                      disabled
                      className="bg-slate-200 text-slate-400 border border-slate-300 border-solid font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-not-allowed uppercase tracking-wider"
                    >
                      Sold Out
                    </button>
                  ) : meal.customizable ? (
                    <button 
                      onClick={() => showCustomizerModal(meal)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      Customize <Settings className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-6 h-8">
                        <button 
                          onClick={() => adjustCardPortionQty(meal.id, -1)}
                          className="px-1.5 h-full text-slate-500 hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1 text-[11px] font-black text-slate-800">{currentQty}</span>
                        <button 
                          onClick={() => adjustCardPortionQty(meal.id, 1)}
                          className="px-1.5 h-full text-slate-500 hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => addCardItemToCart(meal)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer border-0"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center space-y-4">
            <div className="bg-slate-100 text-slate-400 p-5 rounded-full inline-block">
              <Frown className="w-12 h-12 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-850 text-lg">No Dishes Found</h4>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">Try adapting your search tag or active filters query.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
