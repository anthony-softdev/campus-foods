import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, ShoppingBag, Clock, CheckCircle2, Truck, 
  Search, Filter, Plus, Edit2, Trash2, RotateCcw, 
  Layers, Package, MapPin, Phone, MessageSquare, CreditCard,
  User, Check, X, AlertCircle, Sparkles, Image as ImageIcon, Info,
  DollarSign, ChevronRight, RefreshCw, Eye, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, OrderDetails, Category, PaymentMethod, ViewType, UserProfile } from '../types';
import { 
  addMenuItemToDb, 
  deleteMenuItemFromDb, 
  listenAllOrdersFromDb, 
  updateOrderStatusInDb, 
  clearAllOrdersFromDb 
} from '../firebase';

// Inferred types from other components since types.ts is not provided.
// This helps fix type errors within this file.
interface MenuCustomizationChoice {
  value: string | number;
  label: string;
  price: number;
}

type CustomOptionMode = 'choice' | 'quantity';

interface MenuCustomizationOption {
  id: string;
  label:string;
  mode: CustomOptionMode;
  choices: MenuCustomizationChoice[];
}
interface AdminViewProps {
  menuItems: MenuItem[];
  onSetMenuItems: (items: MenuItem[]) => void;
  onNavigate: (view: ViewType) => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

type AdminTab = 'orders' | 'menu' | 'analytics';

export default function AdminView({ menuItems, onSetMenuItems, onNavigate, currentUser, onSignOut }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load orders from Firestore using real-time database listener
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenAllOrdersFromDb((allOrders) => {
      // Sort orders descending by creation timestamp
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(allOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Live order status manager in Firestore
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderDetails['status']) => {
    try {
      await updateOrderStatusInDb(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"!`, 'success');
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Failed to update order status in database.', 'error');
    }
  };

  // Delete individual order record in Firestore
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}? This cannot be undone.`)) {
      try {
        // Import dynamic deletion
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await deleteDoc(doc(db, 'orders', orderId));
        showToast('Order record removed successfully.', 'success');
      } catch (err) {
        console.error('Error deleting order:', err);
        showToast('Error removing order record from database.', 'error');
      }
    }
  };

  // Mark all active or outstanding orders as delivered
  const handleMarkAllAsDelivered = async () => {
    const ordersToUpdate = orders.filter(o => o.status !== 'Delivered');
    const activeCount = ordersToUpdate.length;
    if (activeCount === 0) {
      showToast("All orders in the queue are already marked as Delivered!", 'warning');
      return;
    }
    if (window.confirm(`Mark all ${activeCount} outstanding/active orders as 'Delivered'?`)) {
      try {
        const updatePromises = ordersToUpdate.map(o => updateOrderStatusInDb(o.id, 'Delivered'));
        await Promise.all(updatePromises);
        showToast("All active orders have been successfully updated to 'Delivered'!", 'success');
      } catch (err) {
        console.error("Error marking all as delivered:", err);
        showToast("Failed to update all orders. Please try again.", 'error');
      }
    }
  };

  // Complete clean up and wipe out entire active queue history
  const handleClearAllOrders = async () => {
    if (orders.length === 0) {
      showToast("No order queue records found. History list is already blank.", 'warning');
      return;
    }
    if (window.confirm("Are you absolutely sure you want to CLEAR the entire order queue history? This action is irreversible!")) {
      try {
        await clearAllOrdersFromDb();
        showToast("Order history directory has been completely wiped!", 'success');
      } catch (err) {
        console.error("Error clearing all orders:", err);
        showToast("Failed to clear order history from the database.", "error");
      }
    }
  };

  // ---------------- MENU MANAGEMENT STATES ----------------
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState<Category | 'All'>('All');


  const generateMenuItemId = (name: string, category: Category) => {
    const prefix = category === 'Nigerian Meals' ? 'nig'
      : category === 'Fast Foods' ? 'ff'
      : category === 'Snacks' ? 'sn'
      : category === 'Drinks' ? 'dr'
      : 'dr';

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    const id = `${prefix}-${slug}`;

    // Safety: if the generated id somehow matches the old timestamp pattern
    // (e.g. `item-123456789`) replace it with a stable slug fallback.
    if (/^item-\d+$/.test(id)) {
      return `${prefix}-${Date.now().toString(36)}`;
    }

    return id;
  };

  // Input fields for menu form (Shared between Add / Edit)
  const [formData, setFormData] = useState({
    name: '',
    price: 1500,
    category: 'Nigerian Meals' as Category,
    description: '',
    image: '',
    popular: false,
    inStock: true, // Default to in stock
    customOptions: [] as MenuCustomizationOption[], // Initialize empty
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
      customOptions: item.customOptions ? JSON.parse(JSON.stringify(item.customOptions)) : [], // Deep copy to prevent direct state mutation
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
      popular: false, // Default to not popular for new items
      inStock: true,
      customOptions: [],
    });
    setIsAddingNew(true);
  };

  const closeForm = () => {
    setCustomOptionErrors({});
    setEditingItem(null);
    setIsAddingNew(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.image.trim()) {
      showToast('Please fill out all mandatory menu item details.', 'error');
      return;
    }

    // Validate custom options
    const currentCustomOptionErrors: Record<number, Record<string, string>> = {};
    let hasCustomOptionErrors = false;

    formData.customOptions.forEach((option, optionIndex) => {
      const optionErrors: Record<string, string> = {};
      if (!option.label.trim()) {
        optionErrors.label = 'Option label is required.';
      }
      if (!option.id.trim()) {
        optionErrors.id = 'Option ID is required.';
      } else if (formData.customOptions.filter((o, i) => i !== optionIndex && o.id.trim() === option.id.trim()).length > 0) {
        optionErrors.id = 'Option ID must be unique.';
      }

      option.choices.forEach((choice, choiceIndex) => {
        if (!choice.label.trim()) {
          optionErrors[`choice-${choiceIndex}-label`] = 'Choice label is required.';
        }
        if (choice.value === null || choice.value === undefined || choice.value.toString().trim() === '') {
          optionErrors[`choice-${choiceIndex}-value`] = 'Choice value is required.';
        } else if (option.choices.filter((c, i) => i !== choiceIndex && c.value === choice.value).length > 0) {
          optionErrors[`choice-${choiceIndex}-value`] = 'Choice value must be unique.';
        }
        if (typeof choice.price !== 'number' || isNaN(choice.price) || choice.price < 0) {
          optionErrors[`choice-${choiceIndex}-price`] = 'Price must be a non-negative number.';
        }
      });

      if (Object.keys(optionErrors).length > 0) {
        currentCustomOptionErrors[optionIndex] = optionErrors;
        hasCustomOptionErrors = true;
      }
    });
    setCustomOptionErrors(currentCustomOptionErrors); // Update state with errors

    if (hasCustomOptionErrors) {
      showToast('Please fix errors in custom options.', 'error');
      console.error('Custom option validation errors:', currentCustomOptionErrors);
      return;
    }

    try {
      if (isAddingNew) {
        // Add to database
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

        // Log and force the id to avoid legacy timestamp IDs sneaking in
        console.log('AdminView: saving new menu item with id=', finalNewItem.id);

        await addMenuItemToDb(finalNewItem as MenuItem);
        showToast('New dish added to Uni Kitchen menu successfully!', 'success');
      } else if (editingItem) {
        // Edit to database
        const { customOptions, ...restOfItem } = editingItem; // Destructure to safely handle customOptions
        const finalUpdatedItem = {
          ...restOfItem,
          ...formData,
          ...(formData.customOptions.length > 0 && { customOptions: formData.customOptions })
        };
        await addMenuItemToDb(finalUpdatedItem as MenuItem);
        showToast('Dish updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error saving menu item:', err);
      showToast('Error saving changes to database.', 'error');
    }
    closeForm();
  };

  const handleDeleteMenuItem = async (itemId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the campus menu? Customers won't see it anymore.`)) {
      try {
        await deleteMenuItemFromDb(itemId);
        showToast('Dish deleted successfully!', 'success');
      } catch (err) {
        console.error('Error deleting menu item:', err);
        showToast('Error deleting item from database.', 'error');
      }
    }
  };

  // Helper functions for managing custom options
  const handleAddCustomOption = () => {
    setFormData((prev) => ({
      ...prev,
      customOptions: [
        ...prev.customOptions,
        { id: '', label: '', mode: 'choice', choices: [{ value: '', label: '', price: 0 }] },
      ],
    }));
  };

  const handleRemoveCustomOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customOptions: prev.customOptions.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateCustomOption = (
    optionIndex: number,
    field: keyof MenuCustomizationOption,
    value: string | MenuCustomizationOption['mode']
  ) => {
    setFormData((prev) => ({
      ...prev,
      customOptions: prev.customOptions.map((option, i) => {
        if (i === optionIndex) { // Ensure we're updating the correct option
          const updatedOption = { ...option, [field]: value };
          // If mode changes to 'quantity', ensure only one choice exists
          if (field === 'mode' && (value === 'quantity' || value === 'choice')) {
            if (value === 'quantity') {
              updatedOption.choices = updatedOption.choices.slice(0, 1); // Keep at most one choice
              if (updatedOption.choices.length === 0) { // If no choices, add a default one
                updatedOption.choices = [{ value: '', label: '', price: 0 }];
              }
            } else if (value === 'choice' && updatedOption.choices.length === 0) {
              // If changing to choice mode and no choices exist, add a default one
              updatedOption.choices = [{ value: '', label: '', price: 0 }];
            }
          }
          return updatedOption;
        }
        return option; // Return original option if not the one being updated
      }),
    }));
  };

  const handleAddChoiceToOption = (optionIndex: number) => {
    setFormData((prev) => ({
      ...prev, // Spread previous state
      customOptions: prev.customOptions.map((option, i) =>
        i === optionIndex
          ? { ...option, choices: [...option.choices, { value: '', label: '', price: 0 }] }
          : option
      ),
    }));
  };

  const handleRemoveChoiceFromOption = (optionIndex: number, choiceIndex: number) => {
    setFormData((prev) => ({
      ...prev, // Spread previous state
      customOptions: prev.customOptions.map((option, i) =>
        i === optionIndex
          ? { ...option, choices: option.choices.filter((_, j) => j !== choiceIndex) }
          : option
      ),
    }));
  };

  const handleUpdateChoiceInOption = (
    optionIndex: number,
    choiceIndex: number,
    field: keyof MenuCustomizationChoice,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev, // Spread previous state
      customOptions: prev.customOptions.map((option, i) =>
        i === optionIndex
          ? {
              ...option,
              choices: option.choices.map((choice, j) =>
                j === choiceIndex ? { ...choice, [field]: value } : choice
              ),
            }
          : option
        ),
    }));
  };

  // Toggle inStock status directly from the list
  const handleToggleInStock = async (item: MenuItem) => {
    try {
      const updatedItem = { ...item, inStock: !item.inStock };
      await addMenuItemToDb(updatedItem); // Re-use addMenuItemToDb for update
      // Update local state to reflect change immediately
      onSetMenuItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
      showToast(`'${item.name}' is now ${updatedItem.inStock ? 'in stock' : 'out of stock'}.`, 'success');
    } catch (err) {
      console.error('Error toggling inStock status:', err);
      showToast('Failed to update stock status.', 'error');
    }
  };

  const handleResetMenu = async () => {
    if (window.confirm('Reset the entire menu back to original official default University dishes? All custom items will be lost.')) {
      try {
        showToast('Resetting menu... Please wait.', 'warning');
        for (const item of menuItems) {
          await deleteMenuItemFromDb(item.id);
        }
        showToast('Menu cleared. Reloading...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error('Error resetting menu:', err);
        showToast('Error resetting menu.', 'error');
      }
    }
  };

  // ---------------- ORDER SEARCH & FILTER ----------------
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.phoneNumber.includes(orderSearch) ||
        o.deliveryLocation.toLowerCase().includes(orderSearch.toLowerCase());
      
      const matchesFilter = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredMenuItemsList = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCat = menuFilterCategory === 'All' || item.category === menuFilterCategory;
      return matchesSearch && matchesCat;
    });
  }, [menuItems, menuSearch, menuFilterCategory]);

  // ---------------- ANALYTICS CALCS ----------------
  const stats = useMemo(() => {
    let sales = 0;
    let pending = 0;
    let completed = 0;
    const categoryCounts: Record<string, number> = {};

    orders.forEach(o => {
      if (o.status === 'Delivered') {
        sales += o.total;
        completed += 1;
      } else {
        pending += 1;
      }

      o.items.forEach(ci => {
        const cat = ci.item.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + ci.quantity;
      });
    });

    return {
      sales,
      pending,
      completed,
      avgOrder: completed > 0 ? Math.round(sales / completed) : 0,
      totalCount: orders.length,
      categoryCounts
    };
  }, [orders]);

  // Check authorization - only accessible by Admin accounts
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-[#faf9f6]/90 flex items-center justify-center px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white border border-red-100 rounded-3xl p-8 shadow-sm space-y-6 text-center"
        >
          {/* Security Shield Lock icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle size={32} className="stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-display font-extrabold text-brand-dark tracking-tight">
              Admin Access Only 🔒
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
              The administrator control dashboard is locked for security. Only staff members with designated Admin roles can modify the menu items, alter stock/descriptions, or manage incoming student orders.
            </p>
          </div>

          <div className="bg-[#fff9f2] border border-orange-100 rounded-2xl p-4 text-left font-sans text-[11px] text-gray-500 leading-relaxed font-semibold">
            Please log in with an authorized campus vendor or administrator credential to continue. If you are part of the Campus Foods cafeteria staff, use your official corporate registration invitation key during sign up.
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onNavigate('auth')}
              className="bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-orange-500/10 text-xs cursor-pointer"
            >
              Go to Sign In
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-sans font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs cursor-pointer"
            >
              Go to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#faf9f6] relative">
      
      {/* Dynamic Toast feedback panel */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`fixed top-24 right-6 z-50 flex items-center gap-2.5 p-4 rounded-2xl shadow-xl min-w-[280px] max-w-sm border font-sans text-xs ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-100/80 text-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-100/80 text-rose-800'
                : 'bg-amber-50 border-amber-100/80 text-amber-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={15} className="text-emerald-500 shrink-0 stroke-[2.5]" />}
            {toast.type === 'error' && <AlertCircle size={15} className="text-rose-500 shrink-0 stroke-[2.5]" />}
            {toast.type === 'warning' && <Clock size={15} className="text-amber-500 shrink-0 stroke-[2.5]" />}
            <div className="font-bold">{toast.message}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* VIEW HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-orange-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-brand-orange bg-orange-50 font-sans font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                <Sparkles size={11} className="animate-spin" />
                Administrative Command Centre
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-[#1a1a1a] tracking-tight">
              Uni Kitchen Portals 🏢
            </h1>
            <p className="text-sm font-sans text-gray-500 mt-1">
              Live campus cooking queue, orders management, and real-time menu catalog adjustment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('menu')}
              className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-sans font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <ShoppingBag size={14} />
              Visit Customer Menu
            </button>
            <button
              onClick={handleResetMenu}
              className="bg-[#fff9f2] border border-orange-100 text-brand-orange hover:bg-orange-50 font-sans font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset Menu default
            </button>
            <button
              onClick={onSignOut}
              className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-sans font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* ANALYTICS HIGHLIGHTS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-orange-100/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
              <DollarSign size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Delivered Volume</p>
              <p className="text-xl sm:text-2xl font-display font-black text-brand-dark truncate">
                ₦{stats.sales.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-sans truncate">Gross for {stats.completed} delivered orders</p>
            </div>
          </div>

          <div className="bg-white border border-orange-100/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-brand-orange rounded-2xl shrink-0">
              <Clock size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Cooking/Queued</p>
              <p className="text-xl sm:text-2xl font-display font-black text-brand-dark truncate">
                {stats.pending}
              </p>
              <p className="text-[10px] text-gray-400 font-sans truncate">Active preparation cycles</p>
            </div>
          </div>

          <div className="bg-white border border-orange-100/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <CheckCircle2 size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Delivered Stats</p>
              <p className="text-xl sm:text-2xl font-display font-black text-brand-dark truncate">
                {stats.completed}
              </p>
              <p className="text-[10px] text-gray-400 font-sans truncate">Successful doorsteps deliveries</p>
            </div>
          </div>

          <div className="bg-white border border-orange-100/70 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
              <TrendingUp size={20} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Avg Order value</p>
              <p className="text-xl sm:text-2xl font-display font-black text-brand-dark truncate">
                ₦{stats.avgOrder.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 font-sans truncate">Ticket size average</p>
            </div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 text-sm font-sans font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'border-brand-orange text-brand-orange bg-[#fffbf7]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Package size={16} />
            Orders Workspace ({orders.length})
            {stats.pending > 0 && (
              <span className="inline-flex items-center justify-center bg-brand-orange text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-3 px-6 text-sm font-sans font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'menu'
                ? 'border-brand-orange text-brand-orange bg-[#fffbf7]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Layers size={16} />
            Kitchen Catalog ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-6 text-sm font-sans font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'border-brand-orange text-brand-orange bg-[#fffbf7]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <TrendingUp size={16} />
            University Analytics
          </button>
        </div>

        {/* TAB WORKSPACES */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* FILTERS PANEL */}
              <div className="bg-white border border-orange-100/50 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, name, hostel..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-orange-100 outline-none transition-all text-[#1a1a1a] font-sans font-semibold"
                  />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <span className="text-xs font-sans font-bold text-gray-400">Status Filter:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Placed', 'Preparing', 'Out for Delivery', 'Delivered'].map(st => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all ${
                          orderStatusFilter === st
                            ? 'bg-brand-orange text-white'
                            : 'bg-gray-150 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ADMIN BULK UTILITIES TRIGGER ROW */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 flex-wrap">
                <button
                  onClick={handleMarkAllAsDelivered}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-sans font-extrabold text-[11px] py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={13} className="stroke-[2.5]" />
                  Mark All Active as Delivered ✓
                </button>
                <button
                  onClick={handleClearAllOrders}
                  disabled={orders.length === 0}
                  className="bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-650 border border-red-100 font-sans font-extrabold text-[11px] py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={13} />
                  Force Clear Order Queue 🗑️
                </button>
              </div>

              {/* LIST OF ORDERS */}
              {isLoading ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-sans text-gray-400 font-bold">Synchronizing real-time order history queue...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
                  <div className="text-4xl">📭</div>
                  <h3 className="font-display font-extrabold text-[#1a1a1a] text-lg">No Orders Registered</h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans font-medium">
                    No orders yet. Orders placed by students will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-sans font-black text-gray-400 uppercase tracking-widest">
                      Processing queue ({filteredOrders.length} matching orders)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map(order => (
                      <div 
                        key={order.id}
                        className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm hover:border-brand-orange/40 transition-all flex flex-col lg:flex-row justify-between gap-6"
                      >
                        {/* Status, Time & Customer details */}
                        <div className="space-y-4 flex-grow max-w-2xl">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-xs font-bold text-brand-orange bg-orange-50 border border-orange-100 px-3 py-1 rounded-xl">
                              {order.id}
                            </span>
                            <span className="text-[10px] font-sans text-gray-400 font-semibold">
                              Ordered: {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({new Date(order.createdAt).toLocaleDateString()})
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-extrabold uppercase tracking-wide border ${
                              order.status === 'Placed' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              order.status === 'Preparing' ? 'bg-orange-50 text-[#e07f00] border-orange-200' :
                              order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 text-[#1a1a1a] font-extrabold text-sm">
                                <User size={13} className="text-gray-400" />
                                {order.fullName}
                              </p>
                              <p className="flex items-center gap-1.5 text-gray-500 font-semibold">
                                <Phone size={13} className="text-gray-400" />
                                {order.phoneNumber}
                              </p>
                              <p className="text-gray-400">
                                Email: <span className="text-gray-600 font-mono text-[11px]">{order.userEmail}</span>
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <p className="flex items-center gap-1.5 text-[#1a1a1a] font-bold">
                                <MapPin size={13} className="text-brand-orange" />
                                {order.deliveryLocation}
                              </p>
                              <p className="text-gray-500 font-medium pl-5">
                                Room / Suite: <span className="font-extrabold text-brand-dark">{order.roomNumber}</span>
                              </p>
                              <p className="text-gray-400 text-[11px] flex items-center gap-1.5 pl-5">
                                Payment: <span className="uppercase text-brand-dark font-mono font-bold text-xs">{order.paymentMethod}</span>
                              </p>
                            </div>
                          </div>

                          {order.specialInstructions && (
                            <div className="flex gap-2 p-3 bg-brand-cream-warm/40 border border-[#fff2e2] rounded-2xl text-[11px] font-sans text-[#7a4800] leading-relaxed">
                              <MessageSquare size={13} className="shrink-0 mt-0.5 text-orange-400" />
                              <p><b>Kitchen Request:</b> "{order.specialInstructions}"</p>
                            </div>
                          )}

                          {/* Ordered items details container */}
                          <div className="border-t border-gray-100 pt-3 mt-2">
                            <p className="text-[10px] font-sans font-extrabold uppercase text-gray-400 tracking-widest mb-1.5">ITEMS INCLUDED</p>
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((ci, index) => (
                                <div 
                                  key={index}
                                  className="bg-gray-50 border border-gray-150 px-3 py-1.5 rounded-xl text-xs font-sans text-gray-700 flex items-center gap-1.5"
                                >
                                  <span className="font-extrabold text-[#1a1a1a]">{ci.quantity}x</span>
                                  <span className="font-semibold text-gray-650">{ci.item?.name || 'Dish Item'}</span>
                                  <span className="text-[9px] text-gray-400">₦{ci.item?.price || 0}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive operations workflow */}
                        <div className="lg:border-l lg:border-gray-100 lg:pl-6 shrink-0 flex flex-col justify-between items-stretch lg:w-60 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">Update Cooking Status</span>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Placed')}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  order.status === 'Placed' 
                                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                1. Placed (Pending)
                              </button>

                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  order.status === 'Preparing' 
                                    ? 'bg-orange-100 text-[#7a4800] border-orange-300' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                2. Preparing / Cooking
                              </button>

                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  order.status === 'Out for Delivery' 
                                    ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                }`}
                              >
                                <Truck size={12} className="text-blue-500" />
                                3. Out for Dispatch
                              </button>

                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${
                                  order.status === 'Delivered' 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                }`}
                              >
                                <Check size={12} className="text-emerald-500" />
                                4. Delivered
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-bold leading-none">Gross Total</p>
                              <span className="font-display font-extrabold text-base text-brand-dark">₦{order.total}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                              title="Delete order"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              key="menu-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
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
                      {/* Name of dish */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dish Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Semo + Bitterleaf Soup"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white text-xs pl-4 pr-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold"
                        />
                      </div>

                      {/* Selling price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Price (₦) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                          className="w-full bg-white text-xs pl-4 pr-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category *</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                          className="w-full bg-white text-xs px-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold"
                        >
                          <option value="Nigerian Meals">Nigerian Meals</option>
                          <option value="Fast Foods">Fast Foods</option>
                          <option value="Snacks">Snacks</option>
                          <option value="Drinks">Drinks</option>
                        </select>
                      </div>

                      {/* Photo image URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image URL *</label>
                        <div className="relative">
                          <ImageIcon size={14} className="absolute left-3.5 top-3.5 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="w-full bg-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Brief explanation */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Detail ingredients, cooking styling, serving components..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-white text-xs p-4 rounded-2xl border border-orange-100 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold"
                      />
                    </div>

                    {/* Popular checkbox banner */}
                    <div className="flex items-center gap-2 font-sans py-1">
                      <input
                        type="checkbox"
                        id="popular-toggle"
                        checked={formData.popular}
                        onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                        className="w-4 h-4 rounded border-orange-200 text-brand-orange focus:ring-brand-orange"
                      />
                      <label htmlFor="popular-toggle" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                        Mark as Popular item 🔥 (displays on Homepage recommendations grid)
                      </label>
                    </div>

                    {/* In Stock checkbox banner */}
                    <div className="flex items-center gap-2 font-sans py-1">
                      <input
                        type="checkbox"
                        id="in-stock-toggle"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                        className="w-4 h-4 rounded border-orange-200 text-brand-orange focus:ring-brand-orange"
                      />
                      <label htmlFor="in-stock-toggle" className="text-xs font-bold text-gray-700 cursor-pointer select-none">
                        Available In Stock ✅ (displays on customer menu)
                      </label>
                    </div>

                    {/* Custom Options Section */}
                    {/* Custom Options Section */}
                    <div className="space-y-3 pt-4 border-t border-orange-100/50">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Customizable Options (e.g., Protein, Sides)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddCustomOption}
                          className="px-3 py-1.5 bg-brand-orange hover:bg-[#e07f00] text-white rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Option
                        </button>
                      </div>

                      {formData.customOptions.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No custom options added yet.</p>
                      )}

                      {formData.customOptions.map((option, optionIndex) => (
                        <div key={optionIndex} className="bg-gray-50 border border-gray-150 p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-[#1a1a1a]">Custom Option #{optionIndex + 1}</h4>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomOption(optionIndex)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                              title="Remove this option"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Option Label (e.g., "Protein Option") */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Option Label *</label>
                              <input
                                type="text"
                                placeholder="e.g., Protein Option"
                                value={option.label}
                                onChange={(e) => handleUpdateCustomOption(optionIndex, 'label', e.target.value)}
                                className="w-full bg-white text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-orange"
                                required
                              />
                              {/* {customOptionErrors[optionIndex]?.label && <p className="text-[10px] text-red-500">{customOptionErrors[optionIndex].label}</p>} */}
                              {customOptionErrors[optionIndex]?.label && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {customOptionErrors[optionIndex].label}</p>}
                            </div>
                            {/* Option ID (unique, internal identifier) */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Option ID (e.g., proteinType) *</label>
                              <input
                                type="text"
                                placeholder="e.g., proteinType, sideChoice"
                                value={option.id}
                                onChange={(e) => handleUpdateCustomOption(optionIndex, 'id', e.target.value)}
                                className="w-full bg-white text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-orange"
                                required
                              />
                              <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Info size={10} />
                                Used for internal tracking. Must be unique per item.
                              </p>
                              {customOptionErrors[optionIndex]?.id && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {customOptionErrors[optionIndex].id}</p>}
                            </div>
                          </div>

                          {/* Option Mode (Choice or Quantity) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Option Mode *</label>
                            <select // Changed to select for mode
                              value={option.mode}
                              onChange={(e) => handleUpdateCustomOption(optionIndex, 'mode', e.target.value as CustomOptionMode)}
                              className="w-full bg-white text-xs p-3 rounded-xl border border-gray-200 outline-none focus:border-brand-orange"
                            >
                              <option value="choice">Choice (e.g., Chicken, Beef)</option>
                              <option value="quantity">Quantity (e.g., Extra Portion)</option>
                            </select>
                            {customOptionErrors[optionIndex]?.mode && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {customOptionErrors[optionIndex].mode}</p>}
                          </div>

                          {/* Choices for the option */}
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Choices</label>
                              {option.mode === 'choice' && (
                                <button
                                  type="button"
                                  onClick={() => handleAddChoiceToOption(optionIndex)}
                                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1"
                                >
                                  <Plus size={10} /> Add Choice
                                </button>
                              )}
                            </div>

                            {option.choices.length === 0 && (
                              <p className="text-xs text-gray-400 italic">No choices added for this option.</p>
                            )}
                            {option.mode === 'quantity' && (
                              <p className="text-xs text-gray-400 italic flex items-center gap-1">
                                <Info size={10} />
                                For 'Quantity' mode, only one choice is needed (e.g., "Extra Portion").
                              </p>
                            )}

                            {/* Render choices - only one for quantity mode */}
                            {(option.mode === 'choice' ? option.choices : option.choices.slice(0, 1)).map((choice, choiceIndex) => (
                              <div key={choiceIndex} className="flex items-center gap-2 bg-white border border-gray-100 p-2 rounded-lg">
                                {/* Choice Label (e.g., "Fried Chicken") */}
                                <div className="flex-1 space-y-0.5">
                                  <input
                                    type="text"
                                    placeholder="Label (e.g., Fried Chicken)"
                                    value={choice.label}
                                    onChange={(e) => handleUpdateChoiceInOption(optionIndex, choiceIndex, 'label', e.target.value)}
                                    className="w-full bg-gray-50 text-xs p-2 rounded-md border border-gray-100 outline-none focus:border-brand-orange"
                                    required
                                  />
                                  {customOptionErrors[optionIndex]?.[`choice-${choiceIndex}-label`] && <p className="text-[10px] text-red-500 font-bold">⚠️ {customOptionErrors[optionIndex][`choice-${choiceIndex}-label`]}</p>}
                                </div>
                                {/* Choice Value (internal, e.g., "friedChicken") */}
                                <div className="flex-1 space-y-0.5">
                                  <input
                                    type="text"
                                    placeholder="Value (e.g., friedChicken)"
                                    value={choice.value}
                                    onChange={(e) => handleUpdateChoiceInOption(optionIndex, choiceIndex, 'value', e.target.value)}
                                    className="w-full bg-gray-50 text-xs p-2 rounded-md border border-gray-100 outline-none focus:border-brand-orange"
                                    required
                                  />
                                  {customOptionErrors[optionIndex]?.[`choice-${choiceIndex}-value`] && <p className="text-[10px] text-red-500 font-bold">⚠️ {customOptionErrors[optionIndex][`choice-${choiceIndex}-value`]}</p>}
                                </div>
                                {/* Choice Price (additional cost) */}
                                <div className="w-24 space-y-0.5">
                                  <input
                                    type="number"
                                    placeholder="Add. Price"
                                    value={choice.price}
                                    onChange={(e) => handleUpdateChoiceInOption(optionIndex, choiceIndex, 'price', Number(e.target.value))}
                                    className="w-full bg-gray-50 text-xs p-2 rounded-md border border-gray-100 outline-none focus:border-brand-orange"
                                    min="0"
                                    required
                                  />
                                  {customOptionErrors[optionIndex]?.[`choice-${choiceIndex}-price`] && <p className="text-[10px] text-red-500 font-bold">⚠️ {customOptionErrors[optionIndex][`choice-${choiceIndex}-price`]}</p>}
                                </div>
                                <span className="text-xs text-gray-500 font-bold">₦</span>
                                {option.mode === 'choice' && option.choices.length > 1 && ( // Only allow removing choices if mode is 'choice' and there's more than one
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveChoiceFromOption(optionIndex, choiceIndex)}
                                    className="p-1 text-red-400 hover:bg-red-50 rounded-md"
                                    title="Remove choice"
                                  >
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
                      <button
                        type="button"
                        onClick={closeForm}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-orange hover:bg-[#e07f00] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-orange-500/10 cursor-pointer"
                      >
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
                  <div
                    key={item.id}
                    className="bg-white border border-gray-150 rounded-2xl overflow-hidden hover:border-brand-orange/30 shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview & category sticker */}
                      <div className="h-44 w-full bg-gray-100 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // fallback placeholder
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
                          }}
                        />
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
                          <h4 className="font-display font-extrabold text-[#1a1a1a] text-sm leading-tight">
                            {item.name}
                          </h4>
                          <span className="font-display font-black text-brand-orange shrink-0">
                            ₦{item.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-sans font-medium line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                      <span className="font-mono text-[9px] text-gray-400 font-bold uppercase select-none">
                        ID: {item.id}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {/* In Stock Toggle */}
                        <button
                          onClick={() => handleToggleInStock(item)}
                          className={`flex items-center gap-1 px-3 py-2 border rounded-lg shadow-sm transition-colors cursor-pointer ${
                            item.inStock !== false // Check if it's explicitly false
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                          title={item.inStock !== false ? 'Mark as Out of Stock' : 'Mark as In Stock'}
                        >
                          <span className="text-xs font-semibold">In Stock?</span>
                          {item.inStock !== false ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-brand-orange hover:bg-orange-50 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Edit item"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id, item.name)}
                          className="p-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-lg shadow-sm transition-colors cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans"
            >
              {/* Category charts / statistics list */}
              <div className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm lg:col-span-8 space-y-6">
                <div>
                  <h3 className="font-display font-black text-brand-dark text-base">Popular Food Categories</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Quantity of dishes ordered split by Category classification</p>
                </div>

                <div className="space-y-4">
                  {['Nigerian Meals', 'Fast Foods', 'Snacks', 'Drinks'].map(cat => {
                    const count = stats.categoryCounts[cat] || 0;
                    const maxCount = Math.max(...(Object.values(stats.categoryCounts) as number[]), 1);
                    const percentage = Math.round((count / maxCount) * 100);

                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-bold text-[#1a1a1a]">
                          <span>{cat}</span>
                          <span>{count} units ordered</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden">
                          <div 
                            className="bg-brand-orange h-full rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick instructions / hostels distribution */}
              <div className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm lg:col-span-4 space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-brand-dark text-base">Hostel Hotspots</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Popular delivery points in school</p>
                </div>

                <div className="space-y-3.5 text-xs font-medium">
                  {(() => {
                    const hotspotCounts: Record<string, number> = {};
                    orders.forEach(o => {
                      hotspotCounts[o.deliveryLocation] = (hotspotCounts[o.deliveryLocation] || 0) + 1;
                    });
                    
                    const sortedHotspots = Object.entries(hotspotCounts).sort((a,b) => b[1] - a[1]);

                    if (sortedHotspots.length === 0) {
                      return <p className="text-gray-400 italic">No delivery location statistics recorded yet.</p>;
                    }

                    return sortedHotspots.map(([loc, count], index) => (
                      <div key={loc} className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-[10px]">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 font-bold">{loc}</span>
                        </div>
                        <span className="text-brand-orange font-bold font-mono">{count} order(s)</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
