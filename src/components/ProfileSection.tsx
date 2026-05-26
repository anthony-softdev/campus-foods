import React from 'react';
import { 
  Heart, 
  LogOut, 
  ClipboardList, 
  Timer, 
  ClipboardX 
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Order, MenuItem } from '../types';

interface ProfileSectionProps {
  currentUser: User;
  orders: Order[];
  menu: MenuItem[];
  favoriteMealIds: string[];
  toggleFavoriteMeal: (mealId: string) => void;
  navigateTo: (target: any) => void;
  showCustomizerModal: (item: MenuItem) => void;
  addCardItemToCart: (item: MenuItem) => void;
  handleSignOut: () => void;
}

export default function ProfileSection({
  currentUser,
  orders,
  menu,
  favoriteMealIds,
  toggleFavoriteMeal,
  navigateTo,
  showCustomizerModal,
  addCardItemToCart,
  handleSignOut
}: ProfileSectionProps) {
  const userOrders = orders.filter(o => o.userEmail.toLowerCase() === currentUser.email.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* User overview block */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs h-fit space-y-6">
          
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto shadow-md">
              {`${currentUser.firstname.charAt(0)}${currentUser.lastname.charAt(0)}`.toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{currentUser.firstname} {currentUser.lastname}</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold">{currentUser.email}</p>
            </div>
          </div>

          <hr className="border-slate-100" />
          
          <div className="space-y-3 text-xs sm:text-sm font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Account Role:</span>
              <span className="font-extrabold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 text-[10px]">
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Gender:</span>
              <span className="font-extrabold text-slate-800">{currentUser.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Phone Connected:</span>
              <span className="font-extrabold text-slate-800">{currentUser.phone}</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleSignOut}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs sm:text-sm border border-slate-200 cursor-pointer border-solid"
          >
            <LogOut className="w-4 h-4" /> Sign Out from Campus
          </button>

        </div>

        {/* Dynamic user dashboard collections */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Favorite Meals Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Heart className="text-rose-500 fill-rose-500 w-5 h-5 sm:w-6 sm:h-6" />
                  Your Favorite Meals
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                  Select food items to mark as favorites for lightning-fast reordering.
                </p>
              </div>
            </div>

            {/* List of current favorites */}
            <div className="space-y-4">
              {favoriteMealIds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menu
                    .filter(meal => favoriteMealIds.includes(meal.id))
                    .map(meal => (
                      <div 
                        key={meal.id} 
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 items-center justify-between hover:border-amber-400 transition duration-200 border-solid"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-sm leading-tight truncate">{meal.name}</h4>
                            <p className="text-slate-500 text-[10px] font-bold uppercase truncate">{meal.category}</p>
                            <p className="font-black text-amber-700 text-xs">₦{meal.price}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (meal.customizable) {
                                showCustomizerModal(meal);
                              } else {
                                addCardItemToCart(meal);
                              }
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1 border-0"
                            title="Quick Reorder to Cart"
                          >
                            Reorder
                          </button>
                          <button 
                            type="button"
                            onClick={() => toggleFavoriteMeal(meal.id)}
                            className="text-rose-500 hover:text-rose-600 p-1 transition cursor-pointer bg-transparent border-0"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-1">
                  <p className="text-slate-500 text-xs sm:text-sm font-semibold">You haven't marked any favorite meals yet.</p>
                  <p className="text-slate-400 text-[11px] font-medium">Use the toggle grid below to pin your standard campus meals of choice!</p>
                </div>
              )}
            </div>

            {/* Toggle checklist of all available items */}
            <div className="space-y-3 pt-2 font-sans">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Mark Favorite Camp Items
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {menu.map(meal => {
                  const isFavorited = favoriteMealIds.includes(meal.id);
                  return (
                    <button
                      type="button"
                      key={meal.id}
                      onClick={() => toggleFavoriteMeal(meal.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border border-solid font-bold text-xs transition cursor-pointer text-left ${isFavorited ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-2xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'}`}
                    >
                      <span className="truncate pr-1">{meal.name}</span>
                      <Heart className={`w-3.5 h-3.5 shrink-0 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order history dashboard area */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Your Campus Order History</h2>
              <ClipboardList className="text-slate-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="space-y-6">
              {userOrders.length > 0 ? (
                userOrders.map(order => {
                  const stages: Order['status'][] = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
                  const currentStageIdx = stages.indexOf(order.status);

                  return (
                    <div 
                      key={order.orderId} 
                      className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 relative shadow-2xs border-solid"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 pb-3 border-solid">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Reference ID</p>
                          <h4 className="font-black text-slate-950 text-base sm:text-lg">{order.orderId}</h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {order.status !== 'Delivered' && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200/30 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 border-solid">
                              <Timer className="w-3.5 h-3.5 text-amber-650" />
                              Est: ~{order.estimatedMinutes || 25} mins
                            </span>
                          )}
                          <span className="bg-amber-100 text-amber-900 border border-amber-200/50 text-xs font-bold px-3 py-1 rounded-full shrink-0 border-solid">
                            Status: {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Food items description */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ordered Meal Fractions</p>
                          <ul className="list-disc list-inside space-y-1.5 text-slate-700 font-bold">
                            {order.items.map((item, idX) => (
                              <li key={item.cartId || idX}>
                                {item.quantity}x {item.name}
                                {item.extras.length > 0 && (
                                  <span className="text-amber-700 block text-[11px] font-bold pl-5">
                                    +Toppings: {item.extras.map(e => `${e.label} (₦${e.price})`).join(', ')}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-1 font-sans">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Delivery Destination Spot</p>
                          <p className="text-slate-800 font-extrabold">{order.address}</p>
                          <p className="text-slate-500 font-medium text-xs">Payment code: {order.ref}</p>
                          <p className="text-slate-400 font-medium text-[11px]">Timestamp: {order.timestamp}</p>
                        </div>
                      </div>

                      {/* Pipeline tracking stage wizard */}
                      <div className="bg-slate-100 border border-slate-250 p-4 sm:p-5 rounded-2xl shadow-3xs relative overflow-hidden border-solid">
                        {/* Connector Line behind the steps */}
                        <div className="absolute top-[2.1rem] left-[12%] right-[12%] h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden z-0">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-sky-400 via-amber-400 via-indigo-400 to-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>

                        <div className="flex justify-between items-center relative gap-1 select-none z-10">
                          {stages.map((st, idx) => {
                            const isCompleted = idx < currentStageIdx;
                            const isCurrent = idx === currentStageIdx;
                            
                            // Custom colors & styles for each stage
                            let bubbleStyle = "";
                            let textStyle = "";
                            
                            if (st === 'Pending') {
                              if (isCurrent) {
                                bubbleStyle = "bg-sky-500 border-sky-505 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)] ring-4 ring-sky-100";
                                textStyle = "text-sky-600 font-extrabold";
                              } else if (isCompleted) {
                                bubbleStyle = "bg-sky-100 border-sky-300 text-sky-850";
                                textStyle = "text-sky-600 font-semibold";
                              } else {
                                bubbleStyle = "bg-white border-slate-200 text-slate-400";
                                textStyle = "text-slate-400 font-semibold";
                              }
                            } else if (st === 'Preparing') {
                              if (isCurrent) {
                                bubbleStyle = "bg-amber-500 border-amber-505 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-4 ring-amber-100 animate-pulse";
                                textStyle = "text-amber-700 font-extrabold";
                              } else if (isCompleted) {
                                bubbleStyle = "bg-amber-100 border-amber-300 text-amber-955";
                                textStyle = "text-amber-600 font-semibold";
                              } else {
                                bubbleStyle = "bg-white border-slate-200 text-slate-400";
                                textStyle = "text-slate-400 font-semibold";
                              }
                            } else if (st === 'Out for Delivery') {
                              if (isCurrent) {
                                bubbleStyle = "bg-indigo-500 border-indigo-550 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)] ring-4 ring-indigo-100";
                                textStyle = "text-indigo-700 font-extrabold";
                              } else if (isCompleted) {
                                bubbleStyle = "bg-indigo-100 border-indigo-300 text-indigo-950";
                                textStyle = "text-indigo-600 font-semibold";
                              } else {
                                bubbleStyle = "bg-white border-slate-200 text-slate-400";
                                textStyle = "text-slate-400 font-semibold";
                              }
                            } else if (st === 'Delivered') {
                              if (isCurrent) {
                                bubbleStyle = "bg-emerald-500 border-emerald-555 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-4 ring-emerald-100";
                                textStyle = "text-emerald-700 font-extrabold";
                              } else if (isCompleted) {
                                bubbleStyle = "bg-emerald-100 border-emerald-300 text-emerald-950";
                                textStyle = "text-emerald-700 font-semibold";
                              } else {
                                bubbleStyle = "bg-white border-slate-200 text-slate-400";
                                textStyle = "text-slate-400 font-semibold";
                              }
                            }

                            return (
                              <div key={st} className="flex flex-col items-center space-y-1.5 relative flex-1 text-center font-sans">
                                {/* Dynamic Bubble visualizer */}
                                {isCurrent ? (
                                  <motion.div 
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                                    className={`w-9 h-9 rounded-full border-2 border-solid flex items-center justify-center font-black text-xs z-10 transition-all duration-300 ${bubbleStyle}`}
                                  >
                                    {idx + 1}
                                  </motion.div>
                                ) : (
                                  <div className={`w-8 h-8 rounded-full border border-solid border-slate-200 flex items-center justify-center font-bold text-[11px] z-10 transition-all duration-300 ${bubbleStyle}`}>
                                    {isCompleted ? "✓" : idx + 1}
                                  </div>
                                )}
                                <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold ${textStyle}`}>
                                  {st}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-1 border-t border-slate-200/50 text-xs sm:text-sm font-semibold text-slate-700 border-solid">
                        <span>Delivery Type: {order.deliveryType === 'hostel' ? 'Campus Hostel Room' : order.deliveryType === 'classroom' ? 'Classroom Lecture Block' : 'Self Kitchen Pickup'}</span>
                        <div className="text-slate-900 font-extrabold">
                          Grand Total Paid: <span className="text-amber-600 text-base sm:text-lg font-black">₦{order.total}</span>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                  <div className="bg-slate-50 text-slate-400 p-4 rounded-full border border-slate-100">
                    <ClipboardX className="w-10 h-10 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base sm:text-lg">No Orders Placed Yet</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-xs mx-auto mt-1">Pick awesome delicacies on campus, settle and place your order instantly.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => navigateTo('menu')} 
                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-5 rounded-xl text-xs sm:text-sm transition cursor-pointer border-0"
                  >
                    Order First Meal Now &rarr;
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
