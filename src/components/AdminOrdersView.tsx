import React, { useState, useMemo } from 'react';
import {
  Search, Filter, CheckCircle2, Trash2, User, Phone, MapPin, MessageSquare, Truck, Check
} from 'lucide-react';
import { OrderDetails } from '../types';
import { updateOrderStatusInDb } from '../firebase';

interface AdminOrdersViewProps {
  orders: OrderDetails[];
  isLoading: boolean;
  onDeleteOrder: (orderId: string) => void;
  onClearAllOrders: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function AdminOrdersView({
  orders,
  isLoading,
  onDeleteOrder,
  onClearAllOrders,
  onShowToast,
}: AdminOrdersViewProps) {
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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderDetails['status']) => {
    try {
      await updateOrderStatusInDb(orderId, newStatus);
      onShowToast(`Order status updated to "${newStatus}"!`, 'success');
    } catch (err) {
      console.error('Error updating order status:', err);
      onShowToast('Failed to update order status in database.', 'error');
    }
  };

  const handleMarkAllAsDelivered = async () => {
    const ordersToUpdate = orders.filter(o => o.status !== 'Delivered');
    const activeCount = ordersToUpdate.length;
    if (activeCount === 0) {
      onShowToast("All orders in the queue are already marked as Delivered!", 'warning');
      return;
    }
    if (window.confirm(`Mark all ${activeCount} outstanding/active orders as 'Delivered'?`)) {
      try {
        const updatePromises = ordersToUpdate.map(o => updateOrderStatusInDb(o.id, 'Delivered'));
        await Promise.all(updatePromises);
        onShowToast("All active orders have been successfully updated to 'Delivered'!", 'success');
      } catch (err) {
        console.error("Error marking all as delivered:", err);
        onShowToast("Failed to update all orders. Please try again.", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all ${orderStatusFilter === st ? 'bg-brand-orange text-white' : 'bg-gray-150 text-gray-500 hover:bg-gray-200'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ADMIN BULK UTILITIES TRIGGER ROW */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 flex-wrap">
        <button onClick={handleMarkAllAsDelivered} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 font-sans font-extrabold text-[11px] py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5">
          <CheckCircle2 size={13} className="stroke-[2.5]" />
          Mark All Active as Delivered ✓
        </button>
        <button onClick={onClearAllOrders} disabled={orders.length === 0} className="bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border border-red-100 font-sans font-extrabold text-[11px] py-2 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5">
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
              <div key={order.id} className="bg-white border border-orange-100/70 p-6 rounded-3xl shadow-sm hover:border-brand-orange/40 transition-all flex flex-col lg:flex-row justify-between gap-6">
                {/* Order Details */}
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

                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <p className="text-[10px] font-sans font-extrabold uppercase text-gray-400 tracking-widest mb-1.5">ITEMS INCLUDED</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((ci, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-150 p-3 rounded-2xl text-xs font-sans text-gray-700 self-start">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[#1a1a1a]">{ci.quantity}x</span>
                          <span className="font-semibold text-gray-600">{ci.item?.name || 'Dish Item'}</span>
                          <span className="text-[9px] text-gray-400 ml-auto">₦{ci.item?.price || 0}</span>
                        </div>
                        {ci.customizations && Object.keys(ci.customizations).length > 0 && (
                          <ul className="mt-2 pl-4 text-[11px] text-gray-500 list-disc space-y-0.5 border-t border-gray-200 pt-2">
                            {Object.entries(ci.customizations).flatMap(([optionId, choices]) => {
                              const option = ci.item.customOptions?.find(o => o.id === optionId);
                              return Object.entries(choices).map(([choiceValue, quantity]) => {
                                if (quantity === 0) return null;
                                const choice = option?.choices.find(c => String(c.value) === String(choiceValue));
                                const choiceLabel = choice ? choice.label : String(choiceValue);
                                const priceExtra = choice && choice.price > 0 ? ` (+₦${choice.price})` : '';
                                return <li key={`${optionId}-${choiceValue}`} className="capitalize font-semibold">{quantity > 1 ? `${quantity}x ` : ''}{choiceLabel}{priceExtra}</li>;
                              });
                            })}
                          </ul>
                        )}
                        </div>
                      ))}
                      <div className="bg-blue-50 border border-blue-150 p-3 rounded-2xl text-xs font-sans text-blue-700 self-start flex items-center gap-2">
                        <Truck size={14} className="text-blue-500" />
                        <span className="font-semibold">Delivery Fee</span>
                        <span className="text-[11px] font-bold ml-auto">₦{order.deliveryFee?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="lg:border-l lg:border-gray-100 lg:pl-6 shrink-0 flex flex-col justify-between items-stretch lg:w-60 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">Update Cooking Status</span>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                      <button onClick={() => handleUpdateOrderStatus(order.id, 'Placed')} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${order.status === 'Placed' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        1. Placed (Pending)
                      </button>
                      <button onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${order.status === 'Preparing' ? 'bg-orange-100 text-[#7a4800] border-orange-300' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                        2. Preparing / Cooking
                      </button>
                      <button onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
                        <Truck size={12} className="text-blue-500" />
                        3. Out for Dispatch
                      </button>
                      <button onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-bold text-left border flex items-center gap-1.5 transition-all cursor-pointer ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>
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
                    <button onClick={() => onDeleteOrder(order.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-all border border-red-100" title="Delete order">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}