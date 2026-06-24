import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Plus, Minus, CreditCard, Landmark, Truck, ShieldCheck, CheckCircle2, ShoppingCart, HelpCircle, User, Award } from 'lucide-react';
import { MenuItem, CartItem, PaymentMethod, UserProfile, OrderDetails, ViewType } from '../types';
import { createOrderInDb } from '../firebase';
import { HOSTELLOCATIONS } from '../data/menu';

interface CartViewProps {
  cart: CartItem[];
  onUpdateCartQuantity: (cartItemId: string, dQuantity: number) => void;
  onRemoveFromCart: (cartItemId: string) => void;
  onClearCart: () => void;
  onNavigate: (view: ViewType) => void;
  currentUser: UserProfile | null;
}

export default function CartView({
  cart,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onClearCart,
  onNavigate,
  currentUser
}: CartViewProps) {
  // Form values pre-populated if user is logged in
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [deliveryLocation, setDeliveryLocation] = useState(currentUser?.deliveryLocation || '');
  const [roomNumber, setRoomNumber] = useState(currentUser?.roomNumber && currentUser.roomNumber !== 'N/A' ? currentUser.roomNumber : '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('delivery');

  // Bank transfer receipt upload states
  const [transferScreenshot, setTransferScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError('File size is too large. Max size is 5MB.');
      setTransferScreenshot(null);
      setScreenshotPreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please upload an image file (PNG, JPG, JPEG).');
      setTransferScreenshot(null);
      setScreenshotPreview(null);
      return;
    }

    setTransferScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Sync profile details if user gets logged in after entering cart
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName);
      setPhoneNumber(currentUser.phoneNumber);
      setDeliveryLocation(currentUser.deliveryLocation);
      setRoomNumber(currentUser.roomNumber === 'N/A' ? '' : currentUser.roomNumber);
    }
  }, [currentUser]);

  // Promo code placeholder
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Form error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Order confirmation modal state
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [confirmedLocation, setConfirmedLocation] = useState('');

  // Card placeholder details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Cost tallies
  const deliveryFee = 300; // Flat fee ₦300

  const subtotal = useMemo(() => {
    const customizationExtra = (ci: CartItem) => {
      if (!ci.customizations || !ci.item.customOptions) return 0;
      return ci.item.customOptions.reduce((sum, opt) => {
        const val = ci.customizations ? ci.customizations[opt.id] : undefined;
        if (opt.mode === 'quantity') {
          const unitPrice = opt.choices[0]?.price ?? 0;
          return sum + (Number(val) || 0) * unitPrice;
        }
        // choice mode
        const choice = opt.choices.find(c => c.value === val);
        return sum + (choice?.price ?? 0);
      }, 0);
    };

    return cart.reduce((acc, curr) => acc + (curr.item.price + customizationExtra(curr)) * curr.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    return promoApplied ? Math.round(subtotal * 0.1) : 0; // 10% student promo discount
  }, [subtotal, promoApplied]);

  const total = useMemo(() => {
    return subtotal - discount + deliveryFee;
  }, [subtotal, discount]);

  // Handle promo code application
  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Please type a promo code.');
      return;
    }
    const cleanCode = promoCode.trim().toUpperCase();
    if (cleanCode === 'SUYA10' || cleanCode === 'JOLLOF' || cleanCode === 'CAMPUS') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon. Please enter a valid student promo code.');
      setPromoApplied(false);
    }
  };

  // Checkout validator
  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (!currentUser) {
      onNavigate('auth');
      return;
    }
    if (e) {
      e.preventDefault();
    }
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else {
      // Validate Nigerian phone style (must be exactly 11 numeric digits)
      const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
      if (!/^[0-9]{11}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Enter a valid 11-digit Nigerian phone number (e.g. 08113860805)';
      }
    }

    if (!deliveryLocation) {
      newErrors.deliveryLocation = 'Please select a delivery location.';
    }

    // Card Specific field validations
    if (paymentMethod === 'card') {
      const cleanCardNum = cardNumber.replace(/\D/g, '');
      if (cleanCardNum.length !== 16) {
        newErrors.cardNumber = 'Enter a valid 16-digit Card Number containing only digits.';
      }
      
      const cleanExpiry = cardExpiry.trim();
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(cleanExpiry)) {
        newErrors.cardExpiry = 'Enter MM/YY expiry.';
      } else {
        const parts = cleanExpiry.split('/');
        const month = parseInt(parts[0], 10);
        const year = parseInt('20' + parts[1], 10);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          newErrors.cardExpiry = 'Card has expired.';
        }
      }

      const cleanCvv = cardCvv.trim();
      if (!/^[0-9]{3,4}$/.test(cleanCvv)) {
        newErrors.cardCvv = 'Enter CVV.';
      }
    }

    // Bank Transfer Specific field validations
    if (paymentMethod === 'transfer') {
      if (!transferScreenshot) {
        newErrors.transferScreenshot = 'Please upload your bank transfer receipt screenshot to place order.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to error zone
      const element = document.getElementById('checkout-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setErrors({});
    
    // Simulate Order Placement Success using timestamp + random suffix for uniqueness
    const randomID = `#CF-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    
    // Calculate total order pricing
    const subtotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const deliveryFee = 300; // Match state summary flat fee
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0; // Match 10% promo discount
    const total = subtotal + deliveryFee - discount;

    const newOrder: OrderDetails = {
      id: randomID,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      deliveryLocation,
      roomNumber: roomNumber.trim() || 'N/A',
      specialInstructions: specialInstructions.trim(),
      paymentMethod,
      items: [...cart],
      subtotal,
      deliveryFee,
      total,
      status: 'Placed',
      userEmail: currentUser?.email || 'guest',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Write order directly to cloud Firestore database
      await createOrderInDb(newOrder);

      // 2. Local fallback storage cache
      const storedOrders = localStorage.getItem('campus_foods_orders');
      const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
      allOrders.push(newOrder);
      localStorage.setItem('campus_foods_orders', JSON.stringify(allOrders));
    } catch (e) {
      console.error('Error recording order in Firestore:', e);
    }

    // Reset bank transfer states on success
    setTransferScreenshot(null);
    setScreenshotPreview(null);
    setScreenshotError(null);

    setGeneratedOrderId(randomID);
    setConfirmedLocation(deliveryLocation);
    setIsConfirmationOpen(true);
  };

  // Close confirmation modal, clear app cart, and return back to Dashboard or Home
  const handleConfirmDone = () => {
    setIsConfirmationOpen(false);
    onClearCart();
    if (currentUser) {
      onNavigate('dashboard');
    } else {
      onNavigate('home');
    }
  };

  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Title block */}
      <div className="border-b border-orange-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1a1a1a]">My Shopping Cart 🛍️</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans mt-1">Review your meals, select location and place your secure hostel delivery order.</p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CART ITEMS & CHECKOUT DETAILS FORM */}
          <div className="xl:col-span-7 space-y-8">
            
            {/* Continue Shopping helper link */}
            <div>
              <button
                type="button"
                onClick={() => onNavigate('menu')}
                className="inline-flex items-center gap-2 text-xs font-sans font-extrabold text-[#f78d00] hover:underline cursor-pointer group-hover:translate-x-[-2px] transition-transform"
              >
                ← Continue Shopping / Add More Meals
              </button>
            </div>

            {/* 1. Items list */}
            <div className="bg-white border border-orange-100/60 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-base font-display font-extrabold text-brand-dark flex items-center gap-2 border-b border-orange-50 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                Selected Foods ({cart.length})
              </h2>

              <div className="divide-y divide-orange-50">
                {cart.map((cartItem) => {
                  const customizationExtra = (ci: CartItem) => {
                    if (!ci.customizations || !ci.item.customOptions) return 0;
                    return ci.item.customOptions.reduce((sum, opt) => {
                      const val = ci.customizations ? ci.customizations[opt.id] : undefined;
                      if (opt.mode === 'quantity') {
                        const unitPrice = opt.choices[0]?.price ?? 0;
                        return sum + (Number(val) || 0) * unitPrice;
                      }
                      const choice = opt.choices.find(c => c.value === val);
                      return sum + (choice?.price ?? 0);
                    }, 0);
                  };

                  const perUnit = cartItem.item.price + customizationExtra(cartItem);
                  const itemTotal = perUnit * cartItem.quantity;
                  return (
                    <div key={cartItem.cartId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 animate-fadeIn">
                      
                      {/* Product details (Image + Name + unit price) */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <img 
                          src={cartItem.item.image} 
                          alt={cartItem.item.name} 
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-[#fff2e0] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-bold text-sm text-brand-dark leading-snug break-words">
                            {cartItem.item.name}
                          </h3>
                          {cartItem.customizations && (
                            <div className="mt-1 text-[11px] text-gray-500 space-y-1">
                              {Object.entries(cartItem.customizations).map(([key, value]) => (
                                <p key={key} className="leading-snug capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}: {String(value)}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-brand-orange font-bold mt-1">
                            ₦{cartItem.item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>

                      {/* Controls and Actions row */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t border-dashed border-gray-100 sm:border-0">
                        
                        {/* +/- controls */}
                        <div className="flex items-center bg-orange-50/50 border border-orange-100/50 rounded-2xl p-1 shrink-0">
                          <button
                            onClick={() => onUpdateCartQuantity(cartItem.item.id, -1)}
                            className="w-6.5 h-6.5 rounded-lg bg-white text-gray-500 hover:text-brand-orange flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer select-none"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold font-sans text-brand-dark">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateCartQuantity(cartItem.item.id, 1)}
                            className="w-6.5 h-6.5 rounded-lg bg-white text-gray-500 hover:text-brand-orange flex items-center justify-center font-bold text-xs shadow-sm transition-colors cursor-pointer select-none"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated total for this item */}
                        <div className="text-right sm:min-w-[80px]">
                          <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-bold sm:hidden">Subtotal</span>
                          <span className="text-xs sm:text-sm font-sans font-extrabold text-brand-dark">
                            ₦{itemTotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Trash action */}
                        <button
                          onClick={() => onRemoveFromCart(cartItem.cartId)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Extra food suggestions quick navigation */}
              <div className="pt-4 border-t border-orange-50 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('menu')}
                  className="text-brand-orange font-sans font-extrabold text-xs tracking-wider uppercase hover:underline cursor-pointer"
                >
                  + Add More Items
                </button>
                <span className="text-xs text-gray-400 font-sans">
                  Subtotal: <b>₦{subtotal.toLocaleString()}</b>
                </span>
              </div>
            </div>

            {/* 2. Delivery & Checkout form */}
            {!currentUser ? (
              <div className="bg-white border border-orange-100 rounded-3xl p-8 shadow-sm text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-[#fff2e0] text-brand-orange flex items-center justify-center mx-auto text-2xl font-semibold">
                  🔒
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-brand-dark">Sign In Required to Check Out</h3>
                  <p className="text-xs font-sans text-gray-500 leading-relaxed max-w-sm mx-auto">
                    To maintain secure campus deliveries, track your order in real-time, and earn student loyalty points, please sign in or register an account first.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="w-full max-w-xs mx-auto text-center bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-bold py-3.5 px-6 rounded-2xl transition-all cursor-pointer shadow-md shadow-orange-100 text-xs flex items-center justify-center gap-2"
                >
                  <span>Sign In or Register Now 🔑</span>
                </button>
              </div>
            ) : (
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="bg-white border border-orange-100/60 rounded-3xl p-6 shadow-sm space-y-6">

                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-[11px] font-sans text-emerald-800 font-semibold flex items-center gap-2.5 animate-fadeIn">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Your student delivery details are auto-filled from your official profile: <b>{currentUser.email}</b></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full name input */}
                  <div className="space-y-1.5 font-sans min-w-0">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    className={`w-full min-w-0 bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border outline-none transition-all ${
                      errors.fullName ? 'border-red-450 focus:ring-1 focus:ring-red-450' : 'border-orange-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName}</p>}
                </div>

                {/* Phone number input */}
                <div className="space-y-1.5 font-sans min-w-0">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nigerian Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08113860805"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full min-w-0 bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border outline-none transition-all ${
                      errors.phoneNumber ? 'border-red-450 focus:ring-1 focus:ring-red-450' : 'border-orange-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
                    }`}
                  />
                  {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold">{errors.phoneNumber}</p>}
                </div>
              </div>

              {/* Delivery Dropdown selection list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-sans min-w-0">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Hostel / Faculty Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className={`w-full min-w-0 bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border outline-none transition-all cursor-pointer ${
                      errors.deliveryLocation ? 'border-red-450 focus:ring-1 focus:ring-red-450' : 'border-orange-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
                    }`}
                  >
                    <option value="">Select Delivery Location</option>
                    
                    <optgroup label="🏨 Male Hostels">
                      {HOSTELLOCATIONS.male.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </optgroup>

                    <optgroup label="🏨 Female Hostels">
                      {HOSTELLOCATIONS.female.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </optgroup>

                    <optgroup label="🏫 Academic Faculties & Buildings">
                      {HOSTELLOCATIONS.academic.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </optgroup>

                    <optgroup label="📍 Other Locations">
                      {HOSTELLOCATIONS.other.map((loc) => (
                        <option key={loc.value} value={loc.value}>{loc.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  {errors.deliveryLocation && <p className="text-[10px] text-red-500 font-bold">{errors.deliveryLocation}</p>}
                </div>

                {/* Room / Office (optional) */}
                <div className="space-y-1.5 font-sans min-w-0">
                  <label className="block text-xs font-bold text-gray-750 text-gray-750 uppercase tracking-wider mb-1">
                    Room / Office Number <span className="text-gray-400 font-medium font-sans lowercase normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room B12, Floor 2"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full min-w-0 bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border border-orange-100 focus:border-brand-orange outline-none transition-all"
                  />
                </div>
              </div>

              {/* Special instructions */}
              <div className="space-y-1.5 font-sans min-w-0">
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider mb-1">
                  Special Instructions / Directions <span className="text-gray-400 font-medium font-sans lowercase normal-case">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="e.g. Call me when you get to the gate. I am wearing a green hoodie."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 150))}
                  className="w-full min-w-0 break-words bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border border-orange-100 focus:border-brand-orange outline-none transition-all resize-none"
                />
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                  <span>Describe specific details for the rider.</span>
                  <span>{specialInstructions.length}/150 characters</span>
                </div>
              </div>

              {/* 3. Payment Method Section */}
              <div className="pt-4 border-t border-orange-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Payment Pathway</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* cash/delivery */}
                  <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'delivery' 
                      ? 'border-brand-orange bg-orange-50/50 text-brand-orange' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="delivery" 
                      checked={paymentMethod === 'delivery'} 
                      onChange={() => setPaymentMethod('delivery')}
                      className="sr-only"
                    />
                    <Truck size={20} className="mb-2" />
                    <span className="font-heading font-bold text-xs">Cash on Delivery</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Pay at Hostel Gate</span>
                  </label>

                  {/* Transfer option */}
                  <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'transfer' 
                      ? 'border-brand-orange bg-orange-50/50 text-brand-orange' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="transfer" 
                      checked={paymentMethod === 'transfer'} 
                      onChange={() => setPaymentMethod('transfer')}
                      className="sr-only"
                    />
                    <Landmark size={20} className="mb-2" />
                    <span className="font-heading font-bold text-xs">Bank Transfer</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Quick GTBank Details</span>
                  </label>

                  {/* Card placeholder */}
                  <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-brand-orange bg-orange-50/50 text-brand-orange' 
                      : 'border-gray-200 hover:bg-gray-50 text-gray-500'
                  }`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="sr-only"
                    />
                    <CreditCard size={20} className="mb-2" />
                    <span className="font-heading font-bold text-xs">Debit Card</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Visa / MasterCard</span>
                  </label>

                </div>

                {/* Sub-form display based on selection */}
                {paymentMethod === 'transfer' && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs font-sans text-amber-800 space-y-3 relative overflow-hidden animate-fadeIn">
                    <p className="font-bold">🏦 Bank Transfer Details:</p>
                    <p className="leading-relaxed">
                      Please transfer the exact sum of <b>₦{total.toLocaleString()}</b> to our account below:
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-amber-100 space-y-1 font-mono text-xs select-all text-gray-800">
                      <div>Bank: <b>GTBank (Guaranty Trust Bank)</b></div>
                      <div>Account Name: <b>Campus Foods Ltd</b></div>
                      <div>Account Number: <b>0123456789</b></div>
                    </div>

                    {/* Receipt upload field */}
                    <div className="mt-3 space-y-2">
                      <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Upload Transfer Receipt Screenshot <span className="text-red-500">*</span>
                      </label>
                      <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          setScreenshotError(null);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              setScreenshotError('File size is too large. Max size is 5MB.');
                              setTransferScreenshot(null);
                              setScreenshotPreview(null);
                              return;
                            }
                            if (!file.type.startsWith('image/')) {
                              setScreenshotError('Please upload an image file (PNG, JPG, JPEG).');
                              setTransferScreenshot(null);
                              setScreenshotPreview(null);
                              return;
                            }
                            setTransferScreenshot(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setScreenshotPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                          transferScreenshot 
                            ? 'border-emerald-300 bg-emerald-50/20' 
                            : errors.transferScreenshot 
                              ? 'border-red-300 bg-red-50/10' 
                              : 'border-amber-200 hover:border-brand-orange hover:bg-amber-50/30'
                        }`}
                        onClick={() => document.getElementById('screenshot-upload-input')?.click()}
                      >
                        <input
                          id="screenshot-upload-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {screenshotPreview ? (
                          <div className="space-y-2 flex flex-col items-center">
                            <img src={screenshotPreview} alt="Receipt preview" className="max-h-36 rounded-xl object-contain border border-emerald-150 shadow-sm mx-auto" />
                            <p className="text-[10px] text-emerald-700 font-bold">✓ {transferScreenshot?.name} uploaded</p>
                            <span className="text-[9px] text-gray-400 font-sans">(Tap or drag to replace screenshot)</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 text-amber-850 flex flex-col items-center">
                            <div className="text-xl">📸</div>
                            <p className="font-bold text-[11px]">Tap to browse or drag & drop receipt image</p>
                            <p className="text-[9px] text-amber-600/70">Supports PNG, JPG, JPEG (Max 5MB)</p>
                          </div>
                        )}
                      </div>
                      {errors.transferScreenshot && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {errors.transferScreenshot}</p>}
                      {screenshotError && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {screenshotError}</p>}
                    </div>

                    <p className="text-[10px] text-amber-600/90 font-semibold italic pt-1 border-t border-dashed border-amber-200">
                      * Kindly complete the transfer before placing the order. Our dispatch rider will confirm success on his terminal upon arrival at your hostel gate.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs font-sans space-y-3 animate-fadeIn">
                    <p className="font-bold text-gray-700">💳 Card Details (Placeholder Secure Payments):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                            setCardNumber(formatted);
                            if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: '' }));
                          }}
                          className="bg-white p-2 text-xs font-semibold rounded border border-gray-200 outline-none focus:border-brand-orange w-full"
                        />
                        {errors.cardNumber && <span className="text-[9px] text-red-500 font-bold">{errors.cardNumber}</span>}
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">Expiry MM/YY</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length > 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setCardExpiry(value);
                            if (errors.cardExpiry) setErrors(prev => ({ ...prev, cardExpiry: '' }));
                          }}
                          className="bg-white p-2 text-xs font-semibold rounded border border-gray-200 outline-none focus:border-brand-orange w-full text-center"
                        />
                        {errors.cardExpiry && <span className="text-[9px] text-red-500 font-bold">{errors.cardExpiry}</span>}
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="321"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => {
                            setCardCvv(e.target.value.replace(/\D/g, ''));
                            if (errors.cardCvv) setErrors(prev => ({ ...prev, cardCvv: '' }));
                          }}
                          className="bg-white p-2 text-xs font-semibold rounded border border-gray-200 outline-none focus:border-brand-orange w-full text-center"
                        />
                        {errors.cardCvv && <span className="text-[9px] text-red-500 font-bold">{errors.cardCvv}</span>}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </form>
            )}

          </div>

          {/* RIGHT: ORDER SUMMARY PANEL */}
          <div className="xl:col-span-5 xl:sticky xl:top-[88px] space-y-6">
            
            <div className="bg-white border border-orange-100/60 rounded-3xl p-6 shadow-sm space-y-4 font-sans">
              <h2 className="text-base font-display font-extrabold text-[#1a1a1a] border-b border-orange-50 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                {/* Cost lines */}
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Cart Subtotal</span>
                  <span className="text-gray-800 font-bold">₦{subtotal.toLocaleString()}</span>
                </div>

                { promoApplied && (
                  <div className="flex justify-between text-emerald-605 font-medium">
                    <span>10% Student Promo Discount</span>
                    <span className="font-bold">-₦{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Hostel Delivery Fee</span>
                  <span className="text-gray-800 font-bold">₦{deliveryFee.toLocaleString()}</span>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-center text-sm pt-4 border-t border-orange-50 text-gray-800">
                  <span className="font-bold">Total Bill</span>
                  <span className="font-display font-extrabold text-brand-orange text-lg">₦{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo code area */}
              <div className="pt-4 border-t border-orange-50 space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Do you have a Coupon?</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    disabled={promoApplied}
                    placeholder="e.g. CAMPUS"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-[#fff9f2]/30 text-xs font-semibold p-3 rounded-2xl border border-orange-100 uppercase outline-none focus:border-brand-orange focus:bg-white"
                  />
                  <button
                    type="button"
                    disabled={promoApplied}
                    onClick={handleApplyPromo}
                    className="w-full bg-brand-orange hover:bg-[#e07f00] text-white disabled:bg-gray-300 py-3 rounded-2xl font-sans font-bold text-xs cursor-pointer shadow-md shadow-orange-200 text-center transition-all"
                  >
                    Apply Coupon
                  </button>
                </div>
                {promoApplied && <p className="text-[10px] text-emerald-600 font-bold">✓ Coupon active (10% student discount applied!)</p>}
                {promoError && <p className="text-[10px] text-red-500 font-bold">{promoError}</p>}
                {!promoApplied && <p className="text-[10px] text-gray-400 font-medium">Use code <b>"CAMPUS"</b> or <b>"JOLLOF"</b> to test!</p>}
              </div>

              {/* Large Orange Place Order CTA */}
              <div className="pt-4">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder()}
                    className="w-full text-center bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-orange-200 hover:scale-[1.02] active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Place Order 🚀
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('auth')}
                    className="w-full text-center bg-[#1a1a1a] hover:bg-gray-800 text-white font-sans font-extrabold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-95 text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Sign In to Place Order 🔑
                  </button>
                )}
              </div>

              {/* Guarantee terms */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans mt-3.5 bg-[#fff9f2]/40 p-3 rounded-2xl border border-orange-100/50">
                <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                <p>Hot, warm foods or your money back. Delivered with care by University students.</p>
              </div>

              {/* What happens next? section */}
              <div className="bg-[#fff9f2]/60 border border-orange-100 p-4.5 rounded-3xl space-y-3 font-sans">
                <h3 className="text-xs font-display font-extrabold text-[#1a1a1a] flex items-center gap-1.5">
                  <span>💡</span> What happens next?
                </h3>
                <div className="space-y-3 text-[11px] text-gray-600">
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-orange font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <div>
                      <p className="font-extrabold text-brand-dark">Kitchen Preparation</p>
                      <p className="text-gray-400 text-[10px] leading-relaxed">The vendor receives your order instantly and begins cooking it hot and fresh.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-orange font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <div>
                      <p className="font-extrabold text-brand-dark">Rider Dispatch</p>
                      <p className="text-gray-400 text-[10px] leading-relaxed">A dedicated campus student rider securely bundles and picks up your package.</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-brand-orange font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <div>
                      <p className="font-extrabold text-brand-dark">Hostel Lobby Arrival</p>
                      <p className="text-gray-400 text-[10px] leading-relaxed">The rider will call you directly on your phone upon reaching your hostel gate (estimated in ~15 mins).</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* Empty generic shopping cart state */
        <div className="bg-white border border-orange-100/60 rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#fff2e0] text-brand-orange flex items-center justify-center mx-auto text-3xl">
            🛍️
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-xl text-brand-dark">Your Cart is Empty</h2>
            <p className="text-xs font-sans text-gray-500 leading-relaxed">
              Looks like you haven't selected any Nigerian delicacies or refreshing drinks yet. Trek no more, add something tasty now!
            </p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="w-full text-center bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-bold py-3.5 px-6 rounded-2xl transition-all cursor-pointer shadow-md shadow-orange-200 text-sm"
          >
            Start Ordering delicious foods
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL SUCCESS SCREEN */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-orange-100/80 animate-slideUp space-y-6">
            
            {/* Animated checkmark */}
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500 animate-check-in">
              <CheckCircle2 size={54} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-2xl text-brand-dark">Order Placed Successfully! 🎉</h3>
              <p className="text-sm font-sans text-gray-400 leading-relaxed px-2">
                Your food is already being prepared cleanly and will be delivered to <span className="font-extrabold text-brand-orange">{confirmedLocation}</span> shortly.
              </p>
            </div>

            {/* Receipt block */}
            <div className="bg-[#fff9f2]/70 p-4.5 rounded-2xl border border-orange-100/50 text-xs font-sans space-y-2 text-left">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Order Reference ID:</span>
                <span className="text-brand-dark font-mono font-bold select-all">{generatedOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recipient:</span>
                <span className="text-gray-800 font-bold">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sum:</span>
                <span className="text-brand-orange font-bold font-display text-base">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="space-y-3 pt-2">
              {currentUser ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleConfirmDone}
                    className="w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-750 font-sans font-bold py-3 px-4 rounded-xl transition-all text-xs cursor-pointer shadow-sm"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={() => {
                      setIsConfirmationOpen(false);
                      onClearCart();
                      onNavigate('dashboard');
                    }}
                    className="w-full text-center bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-200 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Track My Order 📍
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConfirmDone}
                  className="w-full text-center bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold py-3.5 rounded-2xl transition-all shadow-md shadow-orange-200 cursor-pointer"
                >
                  Back to Home Dashboard
                </button>
              )}
              <p className="text-[10px] text-gray-400 font-medium">
                Our Rider will call you on <b>{phoneNumber}</b> as soon as they reach the lobby gate. Thank you for using Campus Foods!
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
