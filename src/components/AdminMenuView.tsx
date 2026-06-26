import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, Check, X, Image as ImageIcon, Info
} from 'lucide-react';
import { MenuItem, Category } from '../types';
import {
  addMenuItemToDb,
  deleteMenuItemFromDb,
  listenMenuItemsFromDb,
} from '../firebase';

interface MenuCustomizationChoice {
  value: string | number;
  label: string;
  price: number;
}

type CustomOptionMode = 'choice' | 'quantity';

interface MenuCustomizationOption {
  id: string;
  label: string;
  mode: CustomOptionMode;
  choices: MenuCustomizationChoice[];
}

interface AdminMenuViewProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const generateMenuItemId = (name: string, category: Category) => {
  const prefix = category === 'Nigerian Meals' ? 'nig'
    : category === 'Fast Foods' ? 'ff'
    : category === 'Snacks' ? 'sn'
    : 'dr';
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9\s-]+/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const id = `${prefix}-${slug}`;
  if (/^item-\d+$/.test(id)) {
    return `${prefix}-${Date.now().toString(36)}`;
  }
  return id;
};

export default function AdminMenuView({ onShowToast }: AdminMenuViewProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState<Category | 'All'>('All');

  useEffect(() => {
    const unsubscribe = listenMenuItemsFromDb((items) => {
      setMenuItems(items || []);
    });
    return () => unsubscribe();
  }, []);

  const filteredMenuItemsList = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCat = menuFilterCategory === 'All' || item.category === menuFilterCategory;
      return matchesSearch && matchesCat;
    });
  }, [menuItems, menuSearch, menuFilterCategory]);

  const [formData, setFormData] = useState({
    name: '',
    price: 1000,
    category: 'Nigerian Meals' as Category,
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    popular: false,
    inStock: true,
    customOptions: [] as MenuCustomizationOption[],
  });
  const [customOptionErrors, setCustomOptionErrors] = useState<Record<number, Record<string, string>>>({});

  const openEditModal = (item: MenuItem) => {
    setCustomOptionErrors({});
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      image: item.image,
      popular: !!item.popular,
      inStock: item.inStock !== false,
      customOptions: item.customOptions ? JSON.parse(JSON.stringify(item.customOptions)) : [],
    });
    setIsAddingNew(false);
  };

  const openAddModal = () => {
    setCustomOptionErrors({});
    setEditingItem(null);
    setFormData({
      name: '',
      price: 1000,
      category: 'Nigerian Meals',
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      popular: false,
      inStock: true,
      customOptions: [],
    });
    setIsAddingNew(true);
  };

  const closeForm = () => {
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.image.trim()) {
      onShowToast('Please fill out all mandatory menu item details.', 'error');
      return;
    }
    // ... (validation logic from original file)

    try {
      if (isAddingNew) {
        const generatedId = generateMenuItemId(formData.name.trim(), formData.category);
        const newItemData = {
          id: generatedId,
          name: formData.name.trim(),
          price: Number(formData.price),
          category: formData.category,
          description: formData.description.trim(),
          image: formData.image.trim(),
          popular: formData.popular,
          inStock: formData.inStock,
        };
        const finalNewItem = {
          ...newItemData,
          ...(formData.customOptions.length > 0 && { customOptions: formData.customOptions })
        };
        await addMenuItemToDb(finalNewItem as MenuItem);
        onShowToast('New dish added successfully!', 'success');
      } else if (editingItem) {
        const { customOptions, ...restOfItem } = editingItem;
        const finalUpdatedItem = {
          ...restOfItem,
          ...formData,
          ...(formData.customOptions.length > 0 && { customOptions: formData.customOptions })
        };
        await addMenuItemToDb(finalUpdatedItem as MenuItem);
        onShowToast('Dish updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error saving menu item:', err);
      onShowToast('Error saving changes to database.', 'error');
    }
    closeForm();
  };

  const handleDeleteMenuItem = async (itemId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the campus menu?`)) {
      try {
        await deleteMenuItemFromDb(itemId);
        onShowToast('Dish deleted successfully!', 'success');
      } catch (err) {
        console.error('Error deleting menu item:', err);
        onShowToast('Error deleting item from database.', 'error');
      }
    }
  };

  const handleToggleInStock = async (item: MenuItem) => {
    try {
      const updatedItem = { ...item, inStock: item.inStock === false ? true : false };
      await addMenuItemToDb(updatedItem);
      onShowToast(`'${item.name}' is now ${updatedItem.inStock ? 'in stock' : 'out of stock'}.`, 'success');
    } catch (err) {
      console.error('Error toggling inStock status:', err);
      onShowToast('Failed to update stock status.', 'error');
    }
  };

  const handleAddCustomOption = () => {
    setFormData(prev => ({
      ...prev,
      customOptions: [
        ...prev.customOptions,
        { id: '', label: '', mode: 'choice', choices: [{ label: '', value: '', price: 0 }] }
      ]
    }));
  };

  const handleRemoveCustomOption = (optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      customOptions: prev.customOptions.filter((_, i) => i !== optionIndex)
    }));
  };

  const handleUpdateCustomOption = (optionIndex: number, field: keyof MenuCustomizationOption, value: any) => {
    setFormData(prev => {
      const newOptions = JSON.parse(JSON.stringify(prev.customOptions));
      (newOptions[optionIndex] as any)[field] = value;
      return { ...prev, customOptions: newOptions };
    });
  };

  const handleAddChoiceToOption = (optionIndex: number) => {
    setFormData(prev => {
      const newOptions = JSON.parse(JSON.stringify(prev.customOptions));
      newOptions[optionIndex].choices.push({ label: '', value: '', price: 0 });
      return { ...prev, customOptions: newOptions };
    });
  };

  const handleRemoveChoiceFromOption = (optionIndex: number, choiceIndex: number) => {
    setFormData(prev => {
      const newOptions = JSON.parse(JSON.stringify(prev.customOptions));
      newOptions[optionIndex].choices = newOptions[optionIndex].choices.filter((_: any, i: number) => i !== choiceIndex);
      return { ...prev, customOptions: newOptions };
    });
  };

  const handleUpdateChoiceInOption = (optionIndex: number, choiceIndex: number, field: keyof MenuCustomizationChoice, value: any) => {
    setFormData(prev => {
      const newOptions = JSON.parse(JSON.stringify(prev.customOptions));
      (newOptions[optionIndex].choices[choiceIndex] as any)[field] = value;
      return { ...prev, customOptions: newOptions };
    });
  };

  return (
    <div className="space-y-6">
      {/* FOOD SEARCH & ADD ACTION PANEL */}
      <div className="bg-white border border-orange-100/50 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-grow">
          <div className="relative max-w-sm flex-grow">
            <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search current menu items list..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-orange-100 outline-none transition-all text-[#1a1a1a] font-sans font-semibold"
            />
          </div>
          <select
            value={menuFilterCategory}
            onChange={(e) => setMenuFilterCategory(e.target.value as any)}
            className="bg-[#fff9f2]/40 rounded-2xl border border-orange-100 px-4 py-3 text-xs font-sans font-bold text-[#1a1a1a] outline-none"
          >
            <option value="All">All Food Categories</option>
            <option value="Nigerian Meals">Nigerian Meals</option>
            <option value="Fast Foods">Fast Foods</option>
            <option value="Snacks">Snacks</option>
            <option value="Drinks">Drinks</option>
          </select>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-bold py-3 px-5 rounded-2xl text-xs shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus size={15} />
          Add New Dish Item
        </button>
      </div>

      {/* INPUT MODAL FORM OVERLAY */}
      {(isAddingNew || editingItem) && (
        <div className="bg-orange-50/70 border border-orange-100 p-6 rounded-3xl space-y-4 font-sans max-w-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-orange-100/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs">
                🍜
              </div>
              <h3 className="font-display font-extrabold text-[#1a1a1a] text-sm">
                {isAddingNew ? 'Register New Dish on Campus Menu' : `Edit: ${editingItem?.name}`}
              </h3>
            </div>
            <button
              onClick={closeForm}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSaveItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dish Name *</label>
                <input type="text" required placeholder="e.g. Semo + Bitterleaf Soup" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-white text-xs pl-4 pr-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price (₦) *</label>
                <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white text-xs pl-4 pr-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as Category})} className="w-full bg-white text-xs px-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold">
                  <option value="Nigerian Meals">Nigerian Meals</option>
                  <option value="Fast Foods">Fast Foods</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Drinks">Drinks</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image URL *</label>
                <div className="relative">
                  <ImageIcon size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input type="text" required value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full bg-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold font-mono" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description *</label>
              <textarea required rows={2} placeholder="Detail ingredients, cooking styling, serving components..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white text-xs p-4 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold" />
            </div>
            <div className="flex items-center gap-2 font-sans py-1">
              <input type="checkbox" id="popular-toggle" checked={formData.popular} onChange={(e) => setFormData({...formData, popular: e.target.checked})} className="w-4 h-4 rounded border-orange-200 text-brand-orange focus:ring-brand-orange" />
              <label htmlFor="popular-toggle" className="text-xs font-bold text-gray-700 cursor-pointer select-none">Mark as Popular item 🔥 (displays on Homepage recommendations grid)</label>
            </div>
            <div className="flex items-center gap-2 font-sans py-1">
              <input type="checkbox" id="in-stock-toggle" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} className="w-4 h-4 rounded border-orange-200 text-brand-orange focus:ring-brand-orange" />
              <label htmlFor="in-stock-toggle" className="text-xs font-bold text-gray-700 cursor-pointer select-none">Available In Stock ✅ (displays on customer menu)</label>
            </div>
            <div className="space-y-3 pt-4 border-t border-orange-100/50">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customizable Options (e.g., Protein, Sides)</label>
                <button type="button" onClick={handleAddCustomOption} className="px-3 py-1.5 bg-brand-orange hover:bg-[#e07f00] text-white rounded-xl text-xs font-bold flex items-center gap-1">
                  <Plus size={12} /> Add Option
                </button>
              </div>
              {formData.customOptions.length === 0 && (<p className="text-xs text-gray-400 italic">No custom options added yet.</p>)}
              {formData.customOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="bg-gray-50 border border-gray-150 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-[#1a1a1a]">Custom Option #{optionIndex + 1}</h4>
                    <button type="button" onClick={() => handleRemoveCustomOption(optionIndex)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Remove this option">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Option Label *</label>
                      <input type="text" placeholder="e.g., Protein Option" value={option.label} onChange={(e) => handleUpdateCustomOption(optionIndex, 'label', e.target.value)} className="w-full bg-white text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-orange" required />
                      {customOptionErrors[optionIndex]?.label && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {customOptionErrors[optionIndex].label}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Option ID (e.g., proteinType) *</label>
                      <input type="text" placeholder="e.g., proteinType, sideChoice" value={option.id} onChange={(e) => handleUpdateCustomOption(optionIndex, 'id', e.target.value)} className="w-full bg-white text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-orange" required />
                      <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5"><Info size={10} />Used for internal tracking. Must be unique per item.</p>
                      {customOptionErrors[optionIndex]?.id && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {customOptionErrors[optionIndex].id}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Option Mode *</label>
                    <select value={option.mode} onChange={(e) => handleUpdateCustomOption(optionIndex, 'mode', e.target.value as CustomOptionMode)} className="w-full bg-white text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-orange">
                      <option value="choice">Choice (e.g., Chicken, Beef)</option>
                      <option value="quantity">Quantity (e.g., Extra Portion)</option>
                    </select>
                    {customOptionErrors[optionIndex]?.mode && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {customOptionErrors[optionIndex].mode}</p>}
                  </div>
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Choices</label>
                      {option.mode === 'choice' && (
                        <button type="button" onClick={() => handleAddChoiceToOption(optionIndex)} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1">
                          <Plus size={10} /> Add Choice
                        </button>
                      )}
                    </div>
                    {option.choices.length === 0 && (<p className="text-xs text-gray-400 italic">No choices added for this option.</p>)}
                    {option.mode === 'quantity' && (<p className="text-xs text-gray-400 italic flex items-center gap-1"><Info size={10} />For 'Quantity' mode, only one choice is needed (e.g., "Extra Portion").</p>)}
                    {(option.mode === 'choice' ? option.choices : option.choices.slice(0, 1)).map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center gap-2 bg-white border border-gray-100 p-2 rounded-lg">
                        <div className="flex-1 space-y-0.5">
                          <input type="text" placeholder="Label (e.g., Fried Chicken)" value={choice.label} onChange={(e) => handleUpdateChoiceInOption(optionIndex, choiceIndex, 'label', e.target.value)} className="w-full bg-gray-50 text-xs p-2 rounded-md border border-gray-100 outline-none focus:border-brand-orange" required />
                          {customOptionErrors[optionIndex]?.[`choice-${choiceIndex}-label`] && <p className="text-[10px] text-red-500 font-bold">⚠️ {customOptionErrors[optionIndex][`choice-${choiceIndex}-label`]}</p>}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <input type="text" placeholder="Value (e.g., friedChicken)" value={choice.value} onChange={(e) => handleUpdateChoiceInOption(optionIndex, choiceIndex, 'value', e.target.value)} className="w-full bg-gray-50 text-xs p-2 rounded-md border border-gray-100 outline-none focus:border-brand-orange" required />
                          {customOptionErrors[optionIndex]?.[`choice-${choiceIndex}-value`] && <p className="text-[10px] text-red-500 font-bold">⚠️ {customOptionErrors[optionIndex][`choice-${choiceIndex}-value`]}</p>}
                        </div>
                        <div className="w-24 space-y-0.5">
                          <input type="number" placeholder="Add. Price" value={choice.price} onChange={(e) => handleUpdateChoiceInOption(optionIndex, choiceIndex, 'price', Number(e.target.value))} className="w-full bg-gray-50 text-xs p-2 rounded-md border border-gray-100 outline-none focus:border-brand-orange" min="0" required />
                          {customOptionErrors[optionIndex]?.[`choice-${choiceIndex}-price`] && <p className="text-[10px] text-red-500 font-bold">⚠️ {customOptionErrors[optionIndex][`choice-${choiceIndex}-price`]}</p>}
                        </div>
                        <span className="text-xs text-gray-500 font-bold">₦</span>
                        {option.mode === 'choice' && option.choices.length > 1 && (
                          <button type="button" onClick={() => handleRemoveChoiceFromOption(optionIndex, choiceIndex)} className="p-1 text-red-400 hover:bg-red-50 rounded-md" title="Remove choice">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-orange-100/50">
              <button type="button" onClick={closeForm} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-brand-orange hover:bg-[#e07f00] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-orange-500/10 cursor-pointer">
                <Check size={14} />
                {isAddingNew ? 'Create New Item' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LIST OF CATALOG MENU ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItemsList.map(item => (
          <div key={item.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden hover:border-brand-orange/30 shadow-sm transition-all flex flex-col justify-between">
            <div>
              <div className="h-44 w-full bg-gray-100 relative">
                <img src={item.image} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'; }} />
                <span className="absolute top-3 left-3 bg-[#1a1a1a]/70 text-white font-sans font-extrabold text-[9px] uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm">
                  {item.category}
                </span>
                {item.popular && (
                  <span className="absolute top-3 right-3 bg-brand-orange text-white font-sans font-black text-[9px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md">
                    POPULAR 🔥
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-display font-extrabold text-[#1a1a1a] text-sm leading-tight">{item.name}</h4>
                  <span className="font-display font-black text-brand-orange shrink-0">₦{item.price}</span>
                </div>
                <p className="text-xs text-gray-500 font-sans font-medium line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="font-mono text-[9px] text-gray-400 font-bold uppercase select-none">ID: {item.id}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleToggleInStock(item)} className={`flex items-center gap-1 px-3 py-2 border rounded-lg shadow-sm transition-colors cursor-pointer ${item.inStock !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`} title={item.inStock !== false ? 'Mark as Out of Stock' : 'Mark as In Stock'}>
                  <span className="text-xs font-semibold">In Stock?</span>
                  {item.inStock !== false ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                </button>
                <button onClick={() => openEditModal(item)} className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-brand-orange hover:bg-orange-50 rounded-lg shadow-sm transition-colors cursor-pointer" title="Edit item">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDeleteMenuItem(item.id, item.name)} className="p-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-lg shadow-sm transition-colors cursor-pointer" title="Delete item">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}