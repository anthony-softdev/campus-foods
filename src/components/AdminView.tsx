import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, ShoppingBag, Clock, CheckCircle2, Truck, 
  Trash2, RotateCcw, Layers, Package, Users, XCircle, Search, ChevronLeft, ChevronRight, Download,
  AlertCircle, Sparkles,
  DollarSign, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, OrderDetails, ViewType, UserProfile, Category } from '../types';
import { 
  listenAllOrdersFromDb, 
  clearAllOrdersFromDb,
  deleteOrderFromDb,
  listenAllUsersFromDb,
  listenAppConfigFromDb,
  updateDeliveryFeeInDb,
  updateOrderStatusInDb,
} from '../firebase';
import AdminMenuView from './AdminMenuView';
import AdminUsersView from './AdminUsersView';

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
  menuItems: MenuItem[]; // Passed for analytics tab
  onNavigate: (view: ViewType) => void;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

type AdminTab = 'orders' | 'menu' | 'users' | 'analytics';

const ORDER_STATUSES: OrderDetails['status'][] = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

function AdminOrdersView({ orders, isLoading, onDeleteOrder, onClearAllOrders, onShowToast }: {
  orders: OrderDetails[];
  isLoading: boolean;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderDetails['status'] | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [, forceUpdate] = useState(0);

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      onShowToast('No orders to export.', 'warning');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone Number', 'Delivery Location', 'Room Number', 'Status', 'Total (₦)', 'Items'];

    const formatItems = (items: CartItem[]) => {
      return items.map(cartItem => {
        let itemString = `${cartItem.quantity}x ${cartItem.item.name}`;
        if (cartItem.customizations) {
          const customParts = Object.entries(cartItem.customizations).flatMap(([optionId, choices]) => {
            const option = cartItem.item.customOptions?.find(o => o.id === optionId);
            if (!option) return [];
            return Object.entries(choices).map(([choiceValue, quantity]) => {
              if (quantity === 0) return null;
              const choice = option.choices.find(c => String(c.value) === String(choiceValue));
              const choiceLabel = choice ? choice.label : String(choiceValue);
              if (quantity > 1) {
                return `${quantity}x ${choiceLabel}`;
              }
              return choiceLabel;
            });
          }).filter(Boolean);

          if (customParts.length > 0) {
            itemString += ` (${customParts.join(', ')})`;
          }
        }
        return itemString;
      }).join('; ');
    };

    const rows = filteredOrders.map(order => [order.id, new Date(order.createdAt).toLocaleString(), order.fullName, order.phoneNumber, order.deliveryLocation, order.roomNumber, order.status, order.total, formatItems(order.items)]);

    const escapeCsvField = (field: any) => {
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(row => row.map(escapeCsvField).join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campus_foods_orders_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Export started successfully!', 'success');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderDetails['status']) => {
    if (window.confirm(`Are you sure you want to change this order's status to "${newStatus}"?`)) {
      try {
        await updateOrderStatusInDb(orderId, newStatus);
        onShowToast(`Order status updated to "${newStatus}".`, 'success');
      } catch (error) {
        console.error('Error updating status:', error);
        onShowToast('Failed to update order status.', 'error');
      }
    } else {
      // If user cancels, force a re-render to reset the select input to its original value
      forceUpdate(c => c + 1);
    }
  };

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phoneNumber.includes(searchQuery);
      const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
    setCurrentPage(1); // Reset page on filter change
    return filtered;
  }, [orders, searchQuery, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-orange-100/50 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input type="text" placeholder="Search by Order ID, Name, or Phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-orange-100 outline-none transition-all text-[#1a1a1a] font-sans font-semibold" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans font-bold text-gray-400">Filter by status:</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-[#fff9f2]/40 rounded-2xl border border-orange-100 px-4 py-2.5 text-xs font-sans font-bold text-[#1a1a1a] outline-none">
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={onClearAllOrders} className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition-colors">
            <XCircle size={14} /> Clear History
          </button>
        </div>
      </div>

      <div className="bg-white border border-orange-100/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left font-sans">
            <thead className="bg-orange-50/50 text-[10px] text-gray-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">Order Details</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Items</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.id} className="border-b border-orange-100/50 hover:bg-orange-50/30 transition-colors align-top">
                  <td className="px-6 py-4"><div className="font-mono font-bold text-brand-dark">{order.id}</div><div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</div></td>
                  <td className="px-6 py-4"><div className="font-bold text-gray-800">{order.fullName}</div><div className="text-xs text-gray-500">{order.deliveryLocation} - {order.roomNumber}</div></td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    <ul className="space-y-1.5">
                      {order.items.map((cartItem) => (
                        <li key={cartItem.cartId}>
                          <div className="font-bold text-gray-800">{cartItem.quantity}x {cartItem.item.name}</div>
                          {cartItem.customizations && Object.keys(cartItem.customizations).length > 0 && (
                            <ul className="pl-4 mt-1 space-y-0.5 list-disc list-inside">
                              {Object.entries(cartItem.customizations).flatMap(([optionId, choices]) => {
                                const option = cartItem.item.customOptions?.find(o => o.id === optionId);
                                return Object.entries(choices).map(([choiceValue, quantity]) => {
                                  if (quantity === 0) return null;
                                  const choice = option?.choices.find(c => String(c.value) === String(choiceValue));
                                  const choiceLabel = choice ? choice.label : String(choiceValue);
                                  return (
                                    <li key={`${optionId}-${choiceValue}`} className="text-gray-500 capitalize">{quantity > 1 ? `${quantity}x ` : ''}{choiceLabel}</li>
                                  );
                                });
                              })}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">₦{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as OrderDetails['status'])} className="bg-white border border-gray-200 rounded-lg text-xs font-bold p-2 outline-none focus:border-brand-orange">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDeleteOrder(order.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedOrders.length === 0 && <div className="text-center p-8 text-gray-500">No orders found.</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs font-sans font-semibold text-gray-500 mt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
            <ChevronLeft size={14} /> Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminView({ menuItems, onNavigate, currentUser, onSignOut }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [deliveryFee, setDeliveryFee] = useState<number>(300);
  const [newDeliveryFee, setNewDeliveryFee] = useState<string>('300');

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isClearing, setIsClearing] = useState(false);

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
  const [users, setUsers] = useState<UserProfile[]>([]);

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

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const unsubscribe = listenAllUsersFromDb(setUsers);
      return () => unsubscribe();
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = listenAppConfigFromDb((config) => {
      if (config && typeof config.deliveryFee === 'number') {
        setDeliveryFee(config.deliveryFee);
        setNewDeliveryFee(String(config.deliveryFee));
      }
    });
    return () => unsubscribe();
  }, []);

  // Delete individual order record in Firestore
  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}? This cannot be undone.`)) {
      try {
        await deleteOrderFromDb(orderId);
        showToast('Order record removed successfully.', 'success');
      } catch (err) {
        console.error('Error deleting order:', err);
        showToast('Error removing order record from database.', 'error');
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
      setIsClearing(true);
      try {
        await clearAllOrdersFromDb();
        showToast("Order history directory has been completely wiped!", 'success');
      } catch (err) {
        console.error("Error clearing all orders:", err);
        showToast("Failed to clear order history from the database.", "error");
      } finally {
        setIsClearing(false);
      }
    }
  };
  const handleResetMenu = async () => {
    if (window.confirm('Reset the entire menu back to original official default University dishes? All custom items will be lost.')) {
      try {
        showToast('Resetting menu... Please wait.', 'warning');
        const { deleteMenuItemFromDb } = await import('../firebase');
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

  const handleUpdateDeliveryFee = async () => {
    const fee = parseInt(newDeliveryFee, 10);
    if (isNaN(fee) || fee < 0) {
      showToast('Please enter a valid, non-negative number for the delivery fee.', 'error');
      return;
    }
    try {
      await updateDeliveryFeeInDb(fee);
      showToast('Delivery fee updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating delivery fee:', err);
      showToast('Failed to update delivery fee.', 'error');
    }
  };

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
      } else if (o.status !== 'Cancelled') {
        pending += 1; // Count active orders (Placed, Preparing, Out for Delivery)
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">Active Orders</p>
              <p className="text-xl sm:text-2xl font-display font-black text-brand-dark truncate">
                {stats.pending}
              </p>
              <p className="text-[10px] text-gray-400 font-sans truncate">In queue, cooking, or out for delivery</p>
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
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 text-sm font-sans font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'users'
                ? 'border-brand-orange text-brand-orange bg-[#fffbf7]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Users size={16} />
            User Management ({users.length})
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
            >
              <AdminOrdersView
                orders={orders}
                isLoading={isLoading}
                onDeleteOrder={handleDeleteOrder}
                onClearAllOrders={handleClearAllOrders}
                onShowToast={showToast}
                key={orders.length} // Re-mount component when orders change to reset filters
              />
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              key="menu-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminMenuView onShowToast={showToast} />
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminUsersView
                users={users}
                currentUserEmail={currentUser.email}
                onShowToast={showToast}
              />
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
              <div className="lg:col-span-8">
                <div className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm space-y-6">
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
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm space-y-6">
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

                    return sortedHotspots.slice(0, 5).map(([loc, count], index) => (
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

                <div className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display font-extrabold text-brand-dark text-base flex items-center gap-2">
                      <Truck size={16} />
                      Delivery Settings
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Set the campus-wide delivery fee.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Delivery Fee (₦)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={newDeliveryFee}
                        onChange={(e) => setNewDeliveryFee(e.target.value)}
                        className="w-full bg-gray-50 text-xs pl-4 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-brand-orange text-[#1a1a1a] font-semibold"
                      />
                      <button 
                        onClick={handleUpdateDeliveryFee}
                        className="px-4 py-3 bg-brand-orange hover:bg-[#e07f00] text-white rounded-xl text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
