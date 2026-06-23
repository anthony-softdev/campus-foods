import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Clock, ShoppingBag, MapPin, Award, LogOut, 
  RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, 
  MapPinOff, ChefHat, Bike, HeartHandshake, Save
} from 'lucide-react';
import { OrderDetails, UserProfile, CartItem } from '../types';
import { listenUserOrdersFromDb, updateOrderStatusInDb, saveUserProfileToDb } from '../firebase';
import { HOSTELLOCATIONS } from '../data/menu';

interface DashboardViewProps {
  currentUser: UserProfile;
  activeCart: CartItem[];
  onSignOut: () => void;
  onNavigate: (view: any) => void;
  onSetCart: (cart: CartItem[]) => void;
  isNewUser?: boolean;
}

export default function DashboardView({ 
  currentUser, 
  activeCart,
  onSignOut, 
  onNavigate,
  onSetCart
}: DashboardViewProps) {
  const [profile, setProfile] = useState<UserProfile>(currentUser);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [selectedOrderForTrack, setSelectedOrderForTrack] = useState<OrderDetails | null>(null);

  // Form edit states
  const [editName, setEditName] = useState(currentUser.fullName);
  const [editPhone, setEditPhone] = useState(currentUser.phoneNumber);
  const [editLocation, setEditLocation] = useState(currentUser.deliveryLocation);
  const [editRoom, setEditRoom] = useState(currentUser.roomNumber);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const nigeriaHostels = [
    ...HOSTELLOCATIONS.male.map((h) => h.label),
    ...HOSTELLOCATIONS.female.map((h) => h.label),
    ...HOSTELLOCATIONS.academic.map((h) => h.label),
    ...HOSTELLOCATIONS.other.map((h) => h.label),
  ];

  // Fetch orders matching this specific user email in real-time from Firestore
  useEffect(() => {
    const unsubscribe = listenUserOrdersFromDb(currentUser.email, (userOrders) => {
      setOrders(userOrders);
    });
    return () => unsubscribe();
  }, [currentUser.email]);

  // Synchronize selected track order with live updates from orders list
  useEffect(() => {
    if (selectedOrderForTrack) {
      const match = orders.find(o => o.id === selectedOrderForTrack.id);
      if (match && match.status !== selectedOrderForTrack.status) {
        setSelectedOrderForTrack(match);
      }
    }
  }, [orders, selectedOrderForTrack]);

  // Handle saving profile changes to Firestore and localStorage
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (!editName.trim() || !editPhone.trim() || !editLocation.trim()) {
      setSaveError('All fields marked with * are required.');
      return;
    }

    const cleanPhone = editPhone.trim().replace(/\s+/g, '');
    if (!/^[0-9]{11}$/.test(cleanPhone)) {
      setSaveError('Enter an 11-digit Nigerian phone number (e.g. 08113860805).');
      return;
    }

    const updatedProfile: UserProfile = {
      ...profile,
      fullName: editName.trim(),
      phoneNumber: cleanPhone,
      deliveryLocation: editLocation,
      roomNumber: editRoom.trim() || 'N/A',
    };

    try {
      // 1. Update in application state & localStorage cache
      setProfile(updatedProfile);
      localStorage.setItem('campus_foods_current_user', JSON.stringify(updatedProfile));

      // 2. Persist profile changes synchronously to Firestore users database
      await saveUserProfileToDb(currentUser.email, updatedProfile);

      // 3. Fallback: Update local storage registered users pool
      const usersJson = localStorage.getItem('campus_foods_users');
      if (usersJson) {
        let users = JSON.parse(usersJson);
        const updatedUsers = users.map((u: any) => 
          u.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...u, fullName: updatedProfile.fullName, phoneNumber: updatedProfile.phoneNumber, deliveryLocation: updatedProfile.deliveryLocation, roomNumber: updatedProfile.roomNumber }
            : u
        );
        localStorage.setItem('campus_foods_users', JSON.stringify(updatedUsers));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving user profile to Firestore:', err);
      setSaveError('Failed to synchronize profile data to cloud database.');
    }
  };

  // loyalty points calculations (15 points for every order!)
  const loyaltyPoints = useMemo(() => {
    return orders.length * 15;
  }, [orders]);

  // Combined stats calculations
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((acc, curr) => acc + curr.total, 0);
    
    // Determine favorite meal by counting item frequency
    const mealCounts: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(cartItem => {
         const name = cartItem.item.name;
         mealCounts[name] = (mealCounts[name] || 0) + cartItem.quantity;
      });
    });

    let favMeal = 'None yet 🍽️';
    let maxQuantity = 0;
    Object.entries(mealCounts).forEach(([name, count]) => {
      if (count > maxQuantity) {
        maxQuantity = count;
        favMeal = name;
      }
    });

    return {
      totalOrders,
      totalSpent,
      favMeal
    };
  }, [orders]);

  // Re-order button handler (adds items back to active cart)
  const handleReorder = (orderItems: CartItem[]) => {
    onSetCart(orderItems);
    onNavigate('cart');
  };

  // Mock progression of actively selected order status (for demonstration, synced to Firestore)
  const handleAdvanceStatus = async (orderId: string) => {
    const nextStatusMap: Record<string, 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered'> = {
      'Placed': 'Preparing',
      'Preparing': 'Out for Delivery',
      'Out for Delivery': 'Delivered',
      'Delivered': 'Placed'
    };

    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const nextS = nextStatusMap[targetOrder.status] || 'Placed';

    try {
      // 1. Update status directly in cloud Firestore database
      await updateOrderStatusInDb(orderId, nextS);

      // 2. Reflect in tracking preview
      if (selectedOrderForTrack && selectedOrderForTrack.id === orderId) {
        setSelectedOrderForTrack(prev => prev ? { ...prev, status: nextS } : null);
      }

      // Also sync back to local storage cache for absolute fallback
      const storedOrdersJson = localStorage.getItem('campus_foods_orders');
      if (storedOrdersJson) {
        const allOrders: OrderDetails[] = JSON.parse(storedOrdersJson);
        const allUpdated = allOrders.map((o) => {
          if (o.id === orderId) {
            return { ...o, status: nextS };
          }
          return o;
        });
        localStorage.setItem('campus_foods_orders', JSON.stringify(allUpdated));
      }
    } catch (e) {
      console.error('Error shifting order status:', e);
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-fadeIn">
      
      {/* 1. WELCOME HEADER CONTAINER */}
      <div className="bg-gradient-to-br from-brand-dark to-gray-800 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        {/* Abstract background decorative blobs */}
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-brand-orange/15 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-12 w-32 h-32 rounded-full bg-orange-400/5 blur-xl pointer-events-none" />

        <div className="space-y-2 relative z-10 font-sans">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Hello, {profile.firstName || profile.fullName.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs text-gray-300">
            Registered Email: <span className="text-white font-mono">{profile.email}</span>
          </p>
        </div>
      </div>

      {/* Real-time Order Stats & Spending Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center font-bold text-xl shrink-0">
            📦
          </div>
          <div className="font-sans min-w-0">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <p className="font-display font-black text-xl text-[#1a1a1a]">{stats.totalOrders}</p>
            <p className="text-[9px] text-gray-500">Delivered directly to your block</p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
            ₦
          </div>
          <div className="font-sans min-w-0">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</span>
            <p className="font-display font-black text-xl text-emerald-600">₦{stats.totalSpent.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">Secure transactions with coupon savings</p>
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0">
            🍲
          </div>
          <div className="font-sans min-w-0">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Favourite Meal Choice</span>
            <p className="font-sans font-bold text-sm text-purple-700 truncate" title={stats.favMeal}>{stats.favMeal}</p>
            <p className="text-[9px] text-gray-500">Your highly repeating delicacy</p>
          </div>
        </div>
      </div>

      {/* 2. THREE-PANEL GRID (Stats, Active Tracker, Cart Link) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Orders Box */}
        <div className="bg-white border border-orange-100/60 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fff9f2] text-brand-orange flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
          <div className="font-sans">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Deliveries Ordered</h3>
            <p className="font-display font-black text-2xl text-[#1a1a1a]">{orders.length}</p>
            <p className="text-[9px] text-gray-500">Fast service, 100% on-time</p>
          </div>
        </div>

        {/* Current default location box */}
        <div className="bg-white border border-orange-100/60 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center">
            <MapPin size={22} />
          </div>
          <div className="font-sans">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Default Destination</h3>
            <p className="font-sans font-extrabold text-[#1a1a1a] truncate max-w-[200px] text-sm">
              {profile.deliveryLocation}
            </p>
            <p className="text-[9px] text-gray-500">Room: {profile.roomNumber}</p>
          </div>
        </div>

        {/* Active Cart Quick Link */}
        <div 
          onClick={() => onNavigate('cart')}
          className="bg-brand-orange/5 border border-brand-orange/15 rounded-3xl p-5 hover:bg-brand-orange/10 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center shadow-lg shadow-orange-500/15">
              🛒
            </div>
            <div className="font-sans">
              <h3 className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">Active Shopping Cart</h3>
              <p className="font-sans font-extrabold text-[#1a1a1a] text-sm">
                {activeCart.length > 0 ? `${activeCart.length} Delicious Selection(s)` : 'Cart is Empty'}
              </p>
              <p className="text-[9px] text-gray-500">Checkout or add delicacies</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-brand-orange group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>

      {/* 3. CORE INTERACTIVE SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT (8 cols): ORDER STATUS TRACKER & PAST ORDERS */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* INTERACTIVE TRACKER MODAL PREVIEW IF OPEN */}
          {selectedOrderForTrack && (
            <div className="bg-white border border-orange-150 rounded-3xl p-6 shadow-md space-y-6 animate-slideUp">
              <div className="flex justify-between items-center pb-4 border-b border-orange-50">
                <div>
                  <h3 className="font-display font-extrabold text-base text-brand-dark">
                    Live Dispatch Stepper: <span className="text-brand-orange">{selectedOrderForTrack.id}</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans">
                    Placed on: {new Date(selectedOrderForTrack.createdAt).toLocaleDateString()} {new Date(selectedOrderForTrack.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                
                {/* ADVANCE STATUS SIMULATION BUTTON */}
                <button
                  onClick={() => handleAdvanceStatus(selectedOrderForTrack.id)}
                  className="bg-orange-50 hover:bg-orange-100 text-brand-orange text-[10px] font-sans font-bold px-3 py-1.5 rounded-xl border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Force Order to next dispatch stage for demo testing"
                >
                  <RefreshCw size={11} className="animate-spin-slow" />
                  Simulate Delivery Status 🏍️
                </button>
              </div>

              {/* STEPPER METRIC PROGRESS BAR */}
              <div className="grid grid-cols-4 relative font-sans text-xs font-bold text-center gap-1">
                {/* Horizontal connections lines */}
                <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-gray-100 -z-10 animate-pulse" />
                <div 
                  className="absolute top-5 left-[12.5%] h-1 bg-brand-orange -z-10 transition-all duration-300" 
                  style={{
                    width: 
                      selectedOrderForTrack.status === 'Placed' ? '0%' :
                      selectedOrderForTrack.status === 'Preparing' ? '33.33%' :
                      selectedOrderForTrack.status === 'Out for Delivery' ? '66.66%' : '100%'
                  }}
                />

                {/* Step 1: Placed */}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                    ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrderForTrack.status)
                      ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-500/20 scale-110'
                      : 'bg-white text-gray-300 border-gray-200'
                  }`}>
                    <Clock size={16} />
                  </div>
                  <span className={selectedOrderForTrack.status === 'Placed' ? 'text-brand-orange font-extrabold text-[11px]' : 'text-gray-400 text-[10px]'}>Placed</span>
                </div>

                {/* Step 2: Preparing */}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                    ['Preparing', 'Out for Delivery', 'Delivered'].includes(selectedOrderForTrack.status)
                      ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-500/20'
                      : 'bg-white text-gray-300 border-gray-200'
                  }`}>
                    <ChefHat size={16} />
                  </div>
                  <span className={selectedOrderForTrack.status === 'Preparing' ? 'text-brand-orange font-extrabold text-[11px]' : 'text-gray-400 text-[10px]'}>Preparing</span>
                </div>

                {/* Step 3: Out for Delivery */}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                    ['Out for Delivery', 'Delivered'].includes(selectedOrderForTrack.status)
                      ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-orange-500/20'
                      : 'bg-white text-gray-300 border-gray-200'
                  }`}>
                    <Bike size={16} />
                  </div>
                  <span className={selectedOrderForTrack.status === 'Out for Delivery' ? 'text-brand-orange font-extrabold text-[11px]' : 'text-gray-400 text-[10px]'}>Dispatched</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                    selectedOrderForTrack.status === 'Delivered'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-white text-gray-300 border-gray-200'
                  }`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className={selectedOrderForTrack.status === 'Delivered' ? 'text-emerald-500 font-extrabold text-[11px]' : 'text-gray-400 text-[10px]'}>Arrived!</span>
                </div>
              </div>

              {/* Status explanation box */}
              <div className="bg-[#fff9f2] p-4 rounded-2xl border border-orange-100/50 flex gap-3 items-start text-xs font-sans">
                <span className="text-lg">
                  {selectedOrderForTrack.status === 'Placed' && '📝'}
                  {selectedOrderForTrack.status === 'Preparing' && '👨‍🍳'}
                  {selectedOrderForTrack.status === 'Out for Delivery' && '⚡'}
                  {selectedOrderForTrack.status === 'Delivered' && '🎁'}
                </span>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#1a1a1a]">
                    {selectedOrderForTrack.status === 'Placed' && 'Order validated successfully'}
                    {selectedOrderForTrack.status === 'Preparing' && 'Kitchen is currently assembling ingredients cleanly'}
                    {selectedOrderForTrack.status === 'Out for Delivery' && 'Dispatch rider is currently en route on campus bike'}
                    {selectedOrderForTrack.status === 'Delivered' && 'Enjoy your hot meal lines!'}
                  </h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {selectedOrderForTrack.status === 'Placed' && 'The chef has queued your order. We will start preparing shortly!'}
                    {selectedOrderForTrack.status === 'Preparing' && 'Almost finished! Food hygiene rules are strictly observed at Campus Foods kitchens.'}
                    {selectedOrderForTrack.status === 'Out for Delivery' && `Rider is arriving at ${selectedOrderForTrack.deliveryLocation} soon. Maintain reachable communication on ${selectedOrderForTrack.phoneNumber}!`}
                    {selectedOrderForTrack.status === 'Delivered' && 'Order was delivered to destination. Thank you for your partnership! Please support our rider.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForTrack(null)}
                className="w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-500 font-sans font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer border border-gray-200/60"
              >
                Close Delivery Tracker Section
              </button>
            </div>
          )}

          {/* PAST ORDERS SECTION */}
          <div className="space-y-4">
            <h2 className="text-lg font-display font-extrabold text-brand-dark flex items-center gap-2">
              📋 Your Order History ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="bg-white border border-orange-100/40 rounded-3xl p-12 text-center max-w-md mx-auto space-y-5 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center mx-auto text-2xl">
                  🥣
                </div>
                <div className="space-y-1 text-center font-sans">
                  <h3 className="font-display font-extrabold text-base text-brand-dark">No orders logged yet</h3>
                  <p className="text-xs text-gray-400">
                    You haven't purchased any Nigerian delicacies or icy beverages from Campus Foods yet.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('menu')}
                  className="w-full text-center bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-bold py-3 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Go to Menu Catalogue 🔥
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-white border border-gray-100 rounded-3xl p-4.5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3 font-sans w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-gray-400">{order.id}</span>
                          
                          {/* Status Tag */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase leading-none ${
                            order.status === 'Placed' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            order.status === 'Preparing' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                            order.status === 'Out for Delivery' ? 'bg-orange-50 text-brand-orange border border-orange-200' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            {order.status}
                          </span>

                          <span className="text-[10px] text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>

                        {/* Order Food Lists */}
                        <div className="space-y-1">
                          {order.items.map((ci, index) => (
                            <div key={index} className="text-xs text-[#1a1a1a] font-semibold flex items-center gap-1">
                              <span className="text-brand-orange font-bold font-sans text-xs">{ci.quantity}x</span>
                              {ci.item.name}
                              <span className="text-gray-400 font-normal">({ci.item.category})</span>
                            </div>
                          ))}
                        </div>

                        {/* Destination block */}
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 font-sans">
                          <MapPin size={11} className="text-gray-300" />
                          Delivered to: <span className="font-bold text-gray-500">{order.deliveryLocation} (Room {order.roomNumber})</span>
                        </p>
                      </div>

                      {/* Right action pricing block */}
                      <div className="flex md:flex-col justify-between md:items-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-50 gap-4">
                        <div className="font-sans md:text-right">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total Sum Paid:</p>
                          <p className="font-display font-bold text-base text-brand-orange">
                            ₦{order.total.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Track button */}
                          <button
                            onClick={() => {
                              setSelectedOrderForTrack(order);
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="bg-gray-50 hover:bg-orange-50 hover:text-brand-orange text-gray-500 font-sans font-bold px-3 py-2 rounded-xl text-xs transition-colors border border-gray-200 hover:border-orange-200/50 cursor-pointer"
                          >
                            Live Tracking
                          </button>

                          {/* Order again button */}
                          <button
                            onClick={() => handleReorder(order.items)}
                            className="bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                          >
                            Order Again 🔄
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COMPONENT (4 cols): EDIT ACCOUNT SETTINGS & PROFILE DETAILS */}
        <div className="lg:col-span-4 bg-white border border-orange-100/60 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div className="pb-4 border-b border-orange-50">
            <h2 className="text-base font-display font-extrabold text-[#1a1a1a] flex items-center gap-1.5">
              <User size={18} className="text-brand-orange" />
              Student Profile Card
            </h2>
            <p className="text-[10px] text-gray-400 font-sans mt-0.5">
              Configure defaults to check out in seconds
            </p>
          </div>

          {/* Form edit fields */}
          <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-xs">
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-600 font-semibold animate-fadeIn flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Profile changes saved successfully!
              </div>
            )}

            {saveError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-[11px] text-red-600 font-semibold animate-shake">
                ⚠️ {saveError}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Full Name *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#fff9f2]/20 hover:bg-[#fff9f2]/40 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3 rounded-xl border border-orange-100/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Nigerian Phone Helpline *</label>
              <input
                type="text"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-[#fff9f2]/20 hover:bg-[#fff9f2]/40 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3 rounded-xl border border-orange-100/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Default Delivery Location *</label>
              <select
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-[#fff9f2]/25 hover:bg-[#fff9f2]/40 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3 rounded-xl border border-orange-100/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all appearance-none cursor-pointer"
              >
                {nigeriaHostels.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Room Number / Spot (Optional)</label>
              <input
                type="text"
                placeholder="Block B Rm 3"
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
                className="w-full bg-[#fff9f2]/20 hover:bg-[#fff9f2]/40 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3 rounded-xl border border-orange-100/80 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={13} />
              Save Student Profile
            </button>
          </form>

          {/* DANGEROUS ZONE: LOG OUT */}
          <div className="pt-4 border-t border-orange-50">
            <button
              onClick={onSignOut}
              className="w-full text-center bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-500 font-sans font-bold py-3.5 rounded-xl transition-colors text-xs cursor-pointer border border-gray-200/60 hover:border-red-200 flex items-center justify-center gap-1.5"
            >
              <LogOut size={13} />
              Logout from Device
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
