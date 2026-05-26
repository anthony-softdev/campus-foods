import React from 'react';
import { X, Info, Timer, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';

interface CheckoutModalProps {
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (val: boolean) => void;
  orders: Order[];
  deliveryType: 'hostel' | 'classroom' | 'pickup';
  setDeliveryType: React.Dispatch<React.SetStateAction<'hostel' | 'classroom' | 'pickup'>>;
  deliveryAddress: string;
  setDeliveryAddress: (val: string) => void;
  bankRefCode: string;
  setBankRefCode: (val: string) => void;
  cartSubtotal: number;
  checkoutDeliveryFee: number;
  checkoutGrandTotal: number;
  handlePlaceOrder: (e: React.FormEvent) => void;
}

export default function CheckoutModal({
  isCheckoutOpen,
  setIsCheckoutOpen,
  orders,
  deliveryType,
  setDeliveryType,
  deliveryAddress,
  setDeliveryAddress,
  bankRefCode,
  setBankRefCode,
  cartSubtotal,
  checkoutDeliveryFee,
  checkoutGrandTotal,
  handlePlaceOrder
}: CheckoutModalProps) {
  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center p-4 z-50 cursor-pointer"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed inset-0 m-auto bg-white w-full max-w-xl h-fit rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4.5 z-55 flex flex-col justify-between max-h-[90vh] overflow-y-auto font-sans"
            id="checkout-payment-modal"
          >
            <button 
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer text-sm border-0 bg-transparent animate-pulse"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">Finalize Delivery Checkout</h3>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold">Review your campus locations and reference code to complete.</p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              
              {/* Select spot destination */}
              <div className="space-y-3.5">
                <h4 className="font-extrabold text-slate-800 border-b border-slate-100 pb-1 text-xs border-solid">Delivery Target Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Spot Location Type</label>
                    <select 
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer font-sans"
                    >
                      <option value="hostel">Campus Hostel (₦300)</option>
                      <option value="classroom">Lecture Hall / Department (₦400)</option>
                      <option value="pickup">Kitchen Counter Pickup (Free)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hostel / Hall / Block Number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Hall 4, Room 212"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 border-solid rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500 transition font-sans" 
                    />
                  </div>
                </div>
              </div>

              {/* Direct bank transfer simulation details */}
              <div className="bg-amber-50/50 border border-amber-200 border-solid p-3.5 rounded-2xl space-y-2.5">
                <h4 className="font-extrabold text-amber-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" /> Direct Bank Transfer verification
                </h4>
                <p className="text-[11px] text-amber-850/90 font-medium leading-relaxed">
                  To maintain smooth cashless logistics across our team, please make your transfer of total grand amount below to the campus catering ledger:
                </p>
                
                <div className="text-[11px] space-y-1 bg-white p-3 rounded-xl border border-amber-100 border-solid font-bold text-slate-700 font-sans">
                  <div className="flex justify-between"><span>Central Bank:</span><span>Providus Bank PLC</span></div>
                  <div className="flex justify-between"><span>Account Name:</span><span>Campus Foods Campus Enterprise</span></div>
                  <div className="flex justify-between"><span>Account Number:</span><span>1019283746</span></div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-1">Verify Reference Code / Sender Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. TX-92019 / anthony oguama"
                    value={bankRefCode}
                    onChange={(e) => setBankRefCode(e.target.value)}
                    className="w-full bg-white border border-amber-200 border-solid rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 transition focus:outline-none font-sans" 
                  />
                </div>
              </div>

              {/* Delivery Time Estimation */}
              {(() => {
                const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
                let baseTime = 15;
                if (deliveryType === 'classroom') {
                  baseTime = 25;
                } else if (deliveryType === 'pickup') {
                  baseTime = 8;
                }
                const calculatedMinutes = baseTime + Math.min(activeOrdersCount * 3, 40);
                
                return (
                  <div className="bg-amber-50/40 border border-amber-200 border-solid p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left font-sans">
                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 p-2 rounded-xl text-amber-700 shrink-0">
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Dynamic Delivery ETA</p>
                        <p className="text-xs sm:text-sm font-black text-slate-900">
                          ~{calculatedMinutes} mins
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="bg-amber-100/80 text-amber-955 text-[10px] font-bold px-2.5 py-1 rounded-md leading-none border border-solid border-amber-200/50">
                        {activeOrdersCount} order{activeOrdersCount !== 1 ? 's' : ''} ahead
                      </span>
                      <p className="text-[9px] font-semibold text-slate-500 mt-1 leading-none">Based on volume & distance</p>
                    </div>
                  </div>
                );
              })()}

              {/* Calculations ledger list */}
              <div className="bg-slate-50 border border-slate-150 border-solid p-3.5 rounded-xl font-bold text-xs text-slate-700 space-y-1.5 font-sans">
                <div className="flex justify-between text-slate-500"><span>Cart Subtotal value:</span><span>₦{cartSubtotal}</span></div>
                <div className="flex justify-between text-slate-500"><span>Campus Delivery fee:</span><span>₦{checkoutDeliveryFee}</span></div>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pb-1">
                  <span>Grand Total:</span>
                  <span className="text-amber-655 text-base font-black">₦{checkoutGrandTotal}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 text-sm cursor-pointer border-0"
              >
                <CheckCircle className="w-4 h-4" /> Place Food Order Now
              </button>

            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
