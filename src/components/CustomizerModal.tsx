import React from 'react';
import { X, Check, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, MealOption } from '../types';

interface CustomizerModalProps {
  selectedCustomItem: MenuItem | null;
  setSelectedCustomItem: (val: MenuItem | null) => void;
  selectedCustomExtras: MealOption[];
  toggleSelectOption: (opt: MealOption) => void;
  modalQty: number;
  setModalQty: React.Dispatch<React.SetStateAction<number>>;
  handleAddCustomizedToCart: () => void;
}

export default function CustomizerModal({
  selectedCustomItem,
  setSelectedCustomItem,
  selectedCustomExtras,
  toggleSelectOption,
  modalQty,
  setModalQty,
  handleAddCustomizedToCart
}: CustomizerModalProps) {
  return (
    <AnimatePresence>
      {selectedCustomItem && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCustomItem(null)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 cursor-pointer"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto bg-white w-full max-w-md h-fit rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 z-55 flex flex-col justify-between font-sans"
            id="custom-toppings-modal"
          >
            <button 
              type="button"
              onClick={() => setSelectedCustomItem(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4">
              <img src={selectedCustomItem.image} alt={selectedCustomItem.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">{selectedCustomItem.name}</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-2">{selectedCustomItem.description}</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Option checkboxes selection */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">Customize protein and extra toppings:</h4>
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {selectedCustomItem.options?.map(opt => {
                  const isSelected = selectedCustomExtras.some(e => e.label === opt.label);
                  return (
                    <div 
                      key={opt.label}
                      onClick={() => toggleSelectOption(opt)}
                      className={`flex items-center justify-between border border-solid p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200 bg-slate-50/55 hover:border-amber-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border border-solid flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-800">{opt.label}</span>
                      </div>
                      <span className="font-extrabold text-xs text-amber-600">+₦{opt.price}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portion quantifiers and price calculator bottom logic */}
            <div className="border-t border-slate-100/90 pt-4.5 space-y-4 border-solid">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portions</span>
                  <div className="flex items-center border border-slate-200 border-solid rounded-lg bg-slate-55 overflow-hidden mt-1 w-24 h-8.5">
                    <button 
                      type="button" 
                      onClick={() => setModalQty(prev => prev > 1 ? prev - 1 : 1)}
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer font-bold border-0 bg-transparent"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-grow text-center font-black text-slate-850 text-xs">{modalQty}</span>
                    <button 
                      type="button" 
                      onClick={() => setModalQty(prev => prev + 1)}
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer font-bold border-0 bg-transparent"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right font-sans">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculated Subtotal</p>
                  <span className="text-lg sm:text-xl font-black text-amber-600 block">
                    ₦{(selectedCustomItem.price + selectedCustomExtras.reduce((sum, current) => sum + current.price, 0)) * modalQty}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleAddCustomizedToCart}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-sm cursor-pointer shadow-md shadow-amber-500/10 border-0"
              >
                <Plus className="w-4 h-4" /> Add Plate to Cart
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
