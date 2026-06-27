import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import HomeView from './components/HomeView';
import MenuView from './components/MenuView';
import CartView from './components/CartView';
import ContactView from './components/ContactView';
import AuthView from './components/AuthView';
import DashboardView from './components/DashboardView';
import AdminView from './components/AdminView';
import TermsView from './components/TermsView';
import PrivacyView from './components/PrivacyView';
import NotFoundView from './components/NotFoundView';
import { CartItem, MenuItem, ViewType, UserProfile, OrderDetails } from './types';
import { listenMenuItemsFromDb, listenUserOrdersFromDb, listenAppConfigFromDb } from './firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('campus_foods_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Error loading current user:', e);
      return null;
    }
  });

  const [isNewUser, setIsNewUser] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(300); // Default fee

  const handleAuthSuccess = (user: UserProfile, newUser = false) => {
    setCurrentUser(user);
    setIsNewUser(newUser);
    setCurrentView('dashboard');
  };

  const triggerSignOut = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    localStorage.removeItem('campus_foods_current_user');
    setCurrentUser(null);
    setCurrentView('home');
    setShowLogoutConfirm(false);
    setShowLogoutSuccess(true);
    setTimeout(() => {
      setShowLogoutSuccess(false);
    }, 3000);
  };

  // Load dynamic menu items with real-time database listener and seeder
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const unsubscribe = listenMenuItemsFromDb((items) => {
      setMenuItems(items || []);
    });

    return () => unsubscribe();
  }, []);

  // Load app config like delivery fee
  useEffect(() => {
    const unsubscribe = listenAppConfigFromDb((config) => {
      if (config && typeof config.deliveryFee === 'number') {
        setDeliveryFee(config.deliveryFee);
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist cart items to localStorage on any state modification
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('campus_foods_cart');
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((ci: any) => ({
        cartId: ci.cartId ?? `${ci.item.id}|${JSON.stringify(ci.customizations ?? {})}`,
        item: ci.item,
        quantity: ci.quantity,
        customizations: ci.customizations,
      }));
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      return [];
    }
  });

  // Keep count of total items selected
  const cartCount = useMemo(() => {
    return cart.reduce((total, curr) => total + curr.quantity, 0);
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('campus_foods_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  // Real-time active orders listener for global status notification
  const [activeOrders, setActiveOrders] = useState<OrderDetails[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setActiveOrders([]);
      return;
    }
    const unsubscribe = listenUserOrdersFromDb(currentUser.email, (userOrders) => {
      // Find orders that are in transitional status states
      const actives = userOrders.filter(
        (o) => o.status === 'Placed' || o.status === 'Preparing' || o.status === 'Out for Delivery'
      );
      setActiveOrders(actives);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Dynamic Document Title and Meta description updates
  useEffect(() => {
    const titleMap: Record<ViewType, string> = {
      home: 'Campus Foods | Fast Hostel Food Delivery 🚀',
      menu: 'Tasty Cafeteria Menu | Campus Foods 😋',
      cart: 'Your Food Basket Checkout | Campus Foods 💳',
      contact: 'Support & Help Desk | Campus Foods 💬',
      auth: 'Student & Staff Account Gateway | Campus Foods 🔑',
      dashboard: 'Student Track & Progress Dashboard | Campus Foods 📍',
      admin: 'Administrative Command Centre | Campus Foods 🏢',
      terms: 'Terms of Service | Campus Foods',
      privacy: 'Privacy Policy | Campus Foods',
      not_found: '404 - Page Not Found | Campus Foods',
    };

    const descMap: Record<ViewType, string> = {
      home: 'Piping hot local Nigerian meals and tasty fast foods, delivered straight to your hostel doorway in minutes!',
      menu: 'Explore over 30+ hygienic and delicious Uni Kitchen meals, side snacks, local drinks, and custom pairings.',
      cart: 'Validate your delivery phone number, choose a hostel hallway destination, and wrap up your food basket payment.',
      contact: 'Have inquiries about active delivery cycles or vendor application? Reach out to support directly!',
      auth: 'Register as an administrator vendor or log into your secure student portal to request and track live food cups.',
      dashboard: 'Track cooking queue status, view past historical orders, and manage your default hostel room address.',
      admin: 'Manage active cafeteria queues, adjust pricing, delete custom recipes, and analyze administrative profit volumes.',
      terms: 'Read the terms and conditions for using the Campus Foods delivery service.',
      privacy: 'Understand how Campus Foods collects, uses, and protects your personal data.',
      not_found: 'The page you are looking for could not be found.',
    };

    document.title = titleMap[currentView] || 'Campus Foods — University Hot Food Delivery';

    // Update meta description block dynamically
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descMap[currentView] || 'Nigerian University food delivery web service.');
  }, [currentView]);

  const generateCartId = (itemId: string, customizations?: Record<string, Record<string, number>>): string => {
    if (!customizations || Object.keys(customizations).length === 0) {
      return `${itemId}|{}`;
    }
    // Sort keys to ensure consistent ID regardless of property order
    const sortedCustomizations = Object.keys(customizations).sort().reduce((acc, key) => {
      acc[key] = customizations[key];
      return acc;
    }, {} as Record<string, Record<string, number>>);
    return `${itemId}|${JSON.stringify(sortedCustomizations)}`;
  };

  // Handle adding an item to the cart
  const handleAddToCart = (item: MenuItem, customizations?: Record<string, Record<string, number>>) => {
    const cartId = generateCartId(item.id, customizations);

    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.cartId === cartId);
      if (existing) {
        return prevCart.map((ci) =>
          ci.cartId === cartId ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      const newCartItem: CartItem = { cartId, item, quantity: 1 };
      if (customizations && Object.keys(customizations).length > 0) {
        newCartItem.customizations = customizations;
      }
      return [...prevCart, newCartItem];
    });
  };

  const handleUpdateCartItemCustomizations = (cartItemId: string, newCustomizations: Record<string, Record<string, number>>) => {
    setCart(prevCart => {
      const itemToUpdate = prevCart.find(item => item.cartId === cartItemId);
      if (!itemToUpdate) {
        console.error("Item to update not found in cart");
        return prevCart;
      }

      const cartWithoutOldItem = prevCart.filter(item => item.cartId !== cartItemId);
      const newCartId = generateCartId(itemToUpdate.item.id, newCustomizations);
      const existingItemWithNewCustoms = cartWithoutOldItem.find(item => item.cartId === newCartId);

      if (existingItemWithNewCustoms) {
        return cartWithoutOldItem.map(item => 
          item.cartId === newCartId 
            ? { ...item, quantity: item.quantity + itemToUpdate.quantity } 
            : item
        );
      } else {
        const updatedItem: CartItem = {
          ...itemToUpdate,
          cartId: newCartId,
          customizations: newCustomizations && Object.keys(newCustomizations).length > 0 ? newCustomizations : undefined,
        };
        if (!updatedItem.customizations) {
          delete updatedItem.customizations;
        }
        return [...cartWithoutOldItem, updatedItem];
      }
    });
  };

  // Handle updating quantity +/-
  const handleUpdateCartQuantity = (cartItemId: string, dQuantity: number) => {
    setCart((prevCart) => {
      const exactMatch = prevCart.find((ci) => ci.cartId === cartItemId);
      if (exactMatch) {
        return prevCart
          .map((ci) => {
            if (ci.cartId === cartItemId) {
              return { ...ci, quantity: ci.quantity + dQuantity };
            }
            return ci;
          })
          .filter((ci) => ci.quantity > 0);
      }
      // If no exact cartId match, do nothing. This prevents incorrect updates.
      return prevCart;
    });
  };

  // Handle removing straight from cart
  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.cartId !== cartItemId));
  };

  // Clear cart upon successful order placed
  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('campus_foods_cart');
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      
      {/* 1. Universal Navigation Bar */}
      <Navbar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        cartCount={cartCount} 
        currentUser={currentUser}
        onSignOut={triggerSignOut}
      />

      {/* 2. Main content router */}
      <main className="flex-grow">
        <ErrorBoundary>
          {currentView === 'home' && (
            <HomeView 
              onNavigate={handleNavigate} 
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              menuItems={menuItems}
            />
          )}
          {currentView === 'menu' && (
            <MenuView 
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onNavigate={handleNavigate}
              menuItems={menuItems}
            />
          )}
          {currentView === 'cart' && (
            <CartView 
              cart={cart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onUpdateCartItemCustomizations={handleUpdateCartItemCustomizations}
              deliveryFee={deliveryFee}
            />
          )}
          {currentView === 'contact' && (
            <ContactView />
          )}
          {currentView === 'auth' && (
            <AuthView 
              onAuthSuccess={handleAuthSuccess} 
              onNavigate={handleNavigate} 
            />
          )}
          {currentView === 'dashboard' && currentUser ? (
            <DashboardView 
              currentUser={currentUser}
              activeCart={cart}
              onSignOut={triggerSignOut}
              onNavigate={handleNavigate}
              onSetCart={setCart}
              isNewUser={isNewUser}
            />
          ) : currentView === 'dashboard' ? (
            <AuthView 
              onAuthSuccess={handleAuthSuccess} 
              onNavigate={handleNavigate} 
            />
          ) : null}
          {currentView === 'admin' && (
            <AdminView 
              menuItems={menuItems}
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onSignOut={triggerSignOut}
            />
          )}
          {currentView === 'terms' && (
            <TermsView />
          )}
          {currentView === 'privacy' && (
            <PrivacyView />
          )}
          {!['home', 'menu', 'cart', 'contact', 'auth', 'dashboard', 'admin', 'terms', 'privacy'].includes(currentView) && (
            <NotFoundView
              onNavigate={handleNavigate}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* 3. Universal Footer */}
      <Footer onNavigate={handleNavigate} currentUser={currentUser} />

      {/* Global Real-time Student Active Order Status Tracker Notification */}
      {activeOrders.length > 0 && currentView !== 'dashboard' && (
        <div className="fixed bottom-6 left-6 z-40 bg-white border border-orange-200 p-3.5 rounded-2xl shadow-xl max-w-sm font-sans flex items-center gap-3 animate-slideUp">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-brand-orange animate-pulse">
            🚚
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Order Tracking</p>
            <p className="text-xs font-black text-[#1a1a1a] truncate">
              Order {activeOrders[0].id} is <span className="text-brand-orange">
                {activeOrders[0].status === 'Placed' && 'Placed 📝'}
                {activeOrders[0].status === 'Preparing' && 'Preparing 🧑‍🍳'}
                {activeOrders[0].status === 'Out for Delivery' && 'Dispatched 🚴'}
              </span>
            </p>
          </div>
          <button
            onClick={() => handleNavigate('dashboard')}
            className="bg-brand-orange hover:bg-[#e07f00] text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs"
          >
            Track
          </button>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-gray-100 relative space-y-4 font-sans"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 text-brand-orange flex items-center justify-center text-xl font-bold">
                  🚪
                </div>
                
                <h3 className="font-display font-black text-lg text-[#1a1a1a]">
                  Are you sure?
                </h3>
                
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  You are about to log out of your Campus Foods account. Your active food tracker stats will be securely saved, but you'll need to log back in to monitor or track updates.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-2xl font-sans font-bold text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSignOut}
                  className="flex-1 py-3 rounded-2xl font-sans font-bold text-xs text-white bg-brand-orange hover:bg-[#e07f00] shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Out Success Toast Pop-up */}
      <AnimatePresence>
        {showLogoutSuccess && (
          <div className="fixed bottom-6 right-6 z-[100] p-4 max-w-sm w-full sm:w-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-emerald-500 text-white shadow-xl shadow-emerald-500/15 rounded-2xl px-5 py-4 flex items-center gap-3 font-sans border border-emerald-400"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-black text-white shrink-0">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black">Logged Out Successfully</p>
                <p className="text-[10px] text-emerald-100 font-medium whitespace-nowrap">You have been securely signed out. See you soon!</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
