import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';

interface AdminItemModalProps {
  isAdminItemModalOpen: boolean;
  setIsAdminItemModalOpen: (val: boolean) => void;
  editingItem: MenuItem | null;
  newMealName: string;
  setNewMealName: (val: string) => void;
  newMealCategory: string;
  setNewMealCategory: (val: string) => void;
  newMealPrice: string;
  setNewMealPrice: (val: string) => void;
  newMealDesc: string;
  setNewMealDesc: (val: string) => void;
  newMealImage: string;
  setNewMealImage: (val: string) => void;
  handleSaveCatalogItem: (e: React.FormEvent) => void;
}

export default function AdminItemModal({
  isAdminItemModalOpen,
  setIsAdminItemModalOpen,
  editingItem,
  newMealName,
  setNewMealName,
  newMealCategory,
  setNewMealCategory,
  newMealPrice,
  setNewMealPrice,
  newMealDesc,
  setNewMealDesc,
  newMealImage,
  setNewMealImage,
  handleSaveCatalogItem
}: AdminItemModalProps) {
  return (
    <AnimatePresence>
      {isAdminItemModalOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAdminItemModalOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 cursor-pointer"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto bg-white w-full max-w-md h-fit rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 z-55 flex flex-col justify-between font-sans"
            id="admin-add-item-modal"
          >
            <button 
              type="button"
              onClick={() => setIsAdminItemModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer border-0 bg-transparent animate-pulse"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h3>
            
            <form onSubmit={handleSaveCatalogItem} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meal Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Beans and Fried Plantains"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500 font-sans" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Meal Category</label>
                  <select 
                    value={newMealCategory}
                    onChange={(e) => setNewMealCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-2 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="Main Dishes">Main Dishes</option>
                    <option value="Fast Food/Sides">Fast Food/Sides</option>
                    <option value="Drinks & Desserts">Drinks & Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-semibold">Base Price (₦)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 600"
                    value={newMealPrice}
                    onChange={(e) => setNewMealPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500 font-sans" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Short Description</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Brief description details..."
                  value={newMealDesc}
                  onChange={(e) => setNewMealDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500 font-sans" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Photo Image URL</label>
                <input 
                  type="url" 
                  required 
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newMealImage}
                  onChange={(e) => setNewMealImage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500 font-sans" 
                />
                <p className="text-[9px] text-slate-400 font-medium mt-1">Please paste a high resolution image address link.</p>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl shadow-md transition text-xs sm:text-sm cursor-pointer border-0"
              >
                {editingItem ? 'Save and Update Meal Item' : 'Save and Publish Catalog Item'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
