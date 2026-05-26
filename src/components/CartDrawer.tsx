import React from 'react';
import { 
  ShoppingBag, 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBasket, 
  Lock, 
  CreditCard 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, User } from '../types';

interface CartDrawerProps {
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  cart: CartItem[];
  cartSubtotal: number;
  currentUser: User | null;
  setIsCheckoutOpen: (val: boolean) => void;
  updateCartQuantity: (cartId: string, change: number) => void;
  removeCartItem: (cartId: string) => void;
  navigateTo: (target: any) => void;
}

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  cartSubtotal,
  currentUser,
  setIsCheckoutOpen,
  updateCartQuantity,
  removeCartItem,
  navigateTo
}: CartDrawerProps) {
  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Dark Overlay backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-3xs z-50 cursor-pointer"
          />

          {/* Cart list drawer wrapper */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col font-sans"
            id="shopping-cart-drawer"
          >
            
            {/* Header element */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-base sm:text-lg">
                <ShoppingBag className="text-amber-500 w-5 h-5 shrink-0" /> Shopping Room Cart
              </h3>
              <button 
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150 transition cursor-pointer bg-transparent border-0"
                id="close-cart-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items scroll block */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-4">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div 
                    key={item.cartId} 
                    className="flex gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl relative shadow-3xs"
                  >
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                    
                    <div className="flex-grow space-y-1">
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight max-w-[200px] sm:max-w-xs">{item.name}</h4>
                      {item.extras.length > 0 && (
                        <p className="text-[10px] text-amber-700 font-extrabold">
                          +Toppings: {item.extras.map(e => e.label).join(', ')}
                        </p>
                      )}
                      <div className="flex justify-between items-center pt-1.5">
                        <span className="font-black text-slate-950 text-sm">₦{item.unitPrice * item.quantity}</span>
                        
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden h-7">
                          <button 
                            type="button"
                            onClick={() => updateCartQuantity(item.cartId, -1)}
                            className="px-2 h-full text-slate-500 hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="px-1.5 font-bold text-slate-800 text-[11px]">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateCartQuantity(item.cartId, 1)}
                            className="px-2 h-full text-slate-550 hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => removeCartItem(item.cartId)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition cursor-pointer bg-transparent border-0"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
                  <div className="bg-slate-50 text-slate-400 p-5 rounded-full border border-slate-100">
                    <ShoppingBasket className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-910 text-base sm:text-lg">Your Cart is Empty</h4>
                    <p className="text-xs text-slate-500 font-semibold max-w-[200px] sm:max-w-xs mx-auto mt-1">Pick wholesome meals from our fresh daily catalog.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setIsCartOpen(false); navigateTo('menu'); }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-5 rounded-xl text-xs transition shadow-xs cursor-pointer border-0 font-sans"
                  >
                    Fill My Plate Now
                  </button>
                </div>
              )}
            </div>

            {/* Cart action calculations footer block */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 space-y-4 shrink-0 shadow-2xs font-sans">
                <div className="flex justify-between items-center text-sm sm:text-base font-bold">
                  <span className="text-slate-500 font-semibold">Subtotal summary:</span>
                  <span className="font-black text-slate-950 text-lg sm:text-xl">₦{cartSubtotal}</span>
                </div>

                {currentUser ? (
                  <button 
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 text-sm cursor-pointer border-0"
                  >
                    <CreditCard className="w-4 h-4" /> Go to Delivery Checkout
                  </button>
                ) : (
                  <div className="bg-amber-100 border border-amber-200 p-3 rounded-xl text-xs font-semibold text-amber-800 flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-amber-900">Sign-in Required</p>
                      <p className="text-amber-850/80 mt-0.5 text-[11px]">You must be registered or logged in to dispatch a food order to campus halls.</p>
                      <button 
                        type="button"
                        onClick={() => { setIsCartOpen(false); navigateTo('signin'); }} 
                        className="text-amber-750 hover:underline font-bold mt-1 inline-block bg-transparent border-0"
                      >
                        Get Started &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
