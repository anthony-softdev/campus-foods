import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Home, 
  Menu as MenuIcon, 
  Info, 
  Phone, 
  Shield, 
  ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, User, CartItem, Order, MealOption } from './types';
import { DEFAULT_MENU_ITEMS } from './data';

// Import our custom modular sub-components
import HomeSection from './components/HomeSection';
import MenuSection from './components/MenuSection';
import SignInSection from './components/SignInSection';
import SignUpSection from './components/SignUpSection';
import ProfileSection from './components/ProfileSection';
import AdminSection from './components/AdminSection';
import CartDrawer from './components/CartDrawer';
import CustomizerModal from './components/CustomizerModal';
import CheckoutModal from './components/CheckoutModal';
import AdminItemModal from './components/AdminItemModal';
import Toast from './components/Toast';

// Default Admin and User to pre-populate on startup
const INITIAL_USERS: User[] = [
  {
    firstname: "Admin",
    lastname: "(Admin)",
    gender: "Male",
    email: "admin@campusfoods.com",
    phone: "08037667982",
    password: "admin123",
    role: "admin"
  },
  {
    firstname: "Jane",
    lastname: "Doe",
    gender: "Female",
    email: "jane@campus.edu",
    phone: "08011112222",
    password: "password123",
    role: "user"
  }
];

export default function App() {
  // Navigation Section
  const [currentSection, setCurrentSection] = useState<'home' | 'menu' | 'signin' | 'signup' | 'profile' | 'admin'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core App States
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('campus_menu');
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('campus_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campus_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('campus_orders');
    if (saved) return JSON.parse(saved);
    
    // Default initial order for Jane Doe
    return [
      {
        orderId: "CAMPUS-821940",
        userEmail: "jane@campus.edu",
        userName: "Jane Doe",
        phone: "08011112222",
        items: [
          {
            cartId: "jollof-sample",
            id: "jollof-rice",
            name: "Jollof Rice (Special Portion)",
            image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600",
            basePrice: 600,
            extras: [
              { label: "Plantain Portions", price: 300 },
              { label: "Fried Chicken Drumstick", price: 800 }
            ],
            extrasKey: "Plantain Portions,Fried Chicken Drumstick",
            unitPrice: 1700,
            quantity: 1
          }
        ],
        address: "Hall 3, Block B, Room 304",
        deliveryType: "hostel",
        ref: "TX-SAMPLE92J",
        subtotal: 1700,
        deliveryFee: 300,
        total: 2000,
        status: "Preparing",
        timestamp: "2026-05-20, 08:35:12 AM",
        estimatedMinutes: 26
      }
    ];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Modular custom item customization states
  const [selectedCustomItem, setSelectedCustomItem] = useState<MenuItem | null>(null);
  const [selectedCustomExtras, setSelectedCustomExtras] = useState<MealOption[]>([]);
  const [modalQty, setModalQty] = useState(1);

  // Card element quantity trackers for non-customizable fast additions
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});

  // Checkout Modal status and delivery inputs
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'hostel' | 'classroom' | 'pickup'>('hostel');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [bankRefCode, setBankRefCode] = useState('');

  // Administration input models
  const [isAdminItemModalOpen, setIsAdminItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCategory, setNewMealCategory] = useState('Main Dishes');
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealPrice, setNewMealPrice] = useState('');
  const [newMealImage, setNewMealImage] = useState('');

  // Contact Message Inputs
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // User Sign-up inputs
  const [signupFname, setSignupFname] = useState('');
  const [signupLname, setSignupLname] = useState('');
  const [signupGender, setSignupGender] = useState<string>('Male');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // User Sign-in inputs
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // State-driven premium custom notification toasts.
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Favorite meals state
  const [favoriteMealIds, setFavoriteMealIds] = useState<string[]>([]);

  // Synchronizers
  useEffect(() => {
    localStorage.setItem('campus_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('campus_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('campus_session', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('campus_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`campus_favorites_${currentUser.email.toLowerCase()}`);
      setFavoriteMealIds(saved ? (JSON.parse(saved) as string[]) : []);
    } else {
      setFavoriteMealIds([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`campus_favorites_${currentUser.email.toLowerCase()}`, JSON.stringify(favoriteMealIds));
    }
  }, [favoriteMealIds, currentUser]);

  const toggleFavoriteMeal = (mealId: string) => {
    if (!currentUser) {
      triggerToast("Please log in to save favorite meals!");
      return;
    }
    setFavoriteMealIds(prev => {
      const exists = prev.includes(mealId);
      if (exists) {
        triggerToast("Removed from favorite meals.");
        return prev.filter(id => id !== mealId);
      } else {
        const meal = menu.find(m => m.id === mealId);
        triggerToast(`Added ${meal ? meal.name : 'meal'} to favorites!`);
        return [...prev, mealId];
      }
    });
  };

  // Toast notifier
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  // Switch view with proper scroll resetting
  const navigateTo = (target: typeof currentSection | 'about' | 'contact') => {
    setIsMobileMenuOpen(false);
    setIsCartOpen(false);

    if (target === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        triggerToast("Access Denied: Registered admins only.");
        setCurrentSection('home');
        return;
      }
    }

    if (target === 'about' || target === 'contact') {
      setCurrentSection('home');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setCurrentSection(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Category listing generator
  const categories: string[] = ['All', ...Array.from<string>(new Set(menu.map(m => m.category as string)))];

  // Fast Cart Addition Portion controller
  const adjustCardPortionQty = (mealId: string, change: number) => {
    setCardQuantities(prev => {
      const cur = prev[mealId] || 1;
      const nextNum = cur + change;
      return {
        ...prev,
        [mealId]: nextNum < 1 ? 1 : nextNum
      };
    });
  };

  // Adding meals directly to cart (non-customizable path)
  const addCardItemToCart = (item: MenuItem) => {
    const qty = cardQuantities[item.id] || 1;
    
    // Add to state
    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.id === item.id && c.extrasKey === '');
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartId: `${item.id}-${Date.now()}`,
            id: item.id,
            name: item.name,
            image: item.image,
            basePrice: item.price,
            extras: [],
            extrasKey: '',
            unitPrice: item.price,
            quantity: qty
          }
        ];
      }
    });

    triggerToast(`Added ${qty} portion(s) of ${item.name} to cart!`);
    // Reset individual tracker count
    setCardQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
  };

  // Adding customized meals to cart (customizable toppings path)
  const showCustomizerModal = (item: MenuItem) => {
    setSelectedCustomItem(item);
    setSelectedCustomExtras([]);
    setModalQty(1);
  };

  const toggleSelectOption = (option: MealOption) => {
    setSelectedCustomExtras(prev => {
      const match = prev.find(o => o.label === option.label);
      if (match) {
        return prev.filter(o => o.label !== option.label);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleAddCustomizedToCart = () => {
    if (!selectedCustomItem) return;

    const extrasKey = selectedCustomExtras.map(e => e.label).sort().join(',');
    const unitPrice = selectedCustomItem.price + selectedCustomExtras.reduce((sum, current) => sum + current.price, 0);

    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.id === selectedCustomItem.id && c.extrasKey === extrasKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += modalQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartId: `${selectedCustomItem.id}-${Date.now()}`,
            id: selectedCustomItem.id,
            name: selectedCustomItem.name,
            image: selectedCustomItem.image,
            basePrice: selectedCustomItem.price,
            extras: [...selectedCustomExtras],
            extrasKey: extrasKey,
            unitPrice: unitPrice,
            quantity: modalQty
          }
        ];
      }
    });

    triggerToast(`Added customized portion(s) of ${selectedCustomItem.name} to cart!`);
    setSelectedCustomItem(null);
  };

  // Adjust cart quantities inside drawer
  const updateCartQuantity = (cartId: string, val: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartId === cartId) {
          const nextQty = item.quantity + val;
          return {
            ...item,
            quantity: nextQty < 1 ? 1 : nextQty
          };
        }
        return item;
      });
    });
  };

  const removeCartItem = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    triggerToast("Removed item from cart successfully.");
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery configuration
  let checkoutDeliveryFee = 300;
  if (deliveryType === 'classroom') {
    checkoutDeliveryFee = 400;
  } else if (deliveryType === 'pickup') {
    checkoutDeliveryFee = 0;
  }
  const checkoutGrandTotal = cartSubtotal + checkoutDeliveryFee;

  // Final Order placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!deliveryAddress.trim()) {
      triggerToast("Please provide exact room/block destination!");
      return;
    }
    if (!bankRefCode.trim()) {
      triggerToast("A reference code is required to verify your bank transfer!");
      return;
    }

    // Dynamic delivery estimate based on current unfilled orders count (Pending + Preparing) and distance (deliveryType)
    const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
    let baseTime = 15;
    if (deliveryType === 'classroom') {
      baseTime = 25;
    } else if (deliveryType === 'pickup') {
      baseTime = 8;
    }
    const estimatedMinutes = baseTime + Math.min(activeOrdersCount * 3, 40);

    const orderId = `CAMPUS-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      orderId,
      userEmail: currentUser.email,
      userName: `${currentUser.firstname} ${currentUser.lastname}`,
      phone: currentUser.phone,
      items: [...cart],
      address: deliveryAddress,
      deliveryType,
      ref: bankRefCode,
      subtotal: cartSubtotal,
      deliveryFee: checkoutDeliveryFee,
      total: checkoutGrandTotal,
      status: 'Pending',
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      estimatedMinutes
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setDeliveryAddress('');
    setBankRefCode('');
    triggerToast("Order placed successfully! Monitor state below.");
    navigateTo('profile');
  };

  // Sign-up process
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupFname || !signupLname || !signupEmail || !signupPhone || !signupPassword) {
      triggerToast("All registration parameters must be completed.");
      return;
    }

    const emailMatch = users.find(u => u.email.toLowerCase() === signupEmail.toLowerCase());
    if (emailMatch) {
      triggerToast("Account already exists with this email address!");
      return;
    }

    const newUser: User = {
      firstname: signupFname,
      lastname: signupLname,
      gender: signupGender,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      role: 'user'
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    triggerToast(`Congratulations, ${signupFname}! Account created!`);

    // Reset fields
    setSignupFname('');
    setSignupLname('');
    setSignupEmail('');
    setSignupPhone('');
    setSignupPassword('');
    
    navigateTo('home');
  };

  // Sign-in process
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loggedUser = users.find(
      u => u.email.toLowerCase() === signinEmail.toLowerCase() && u.password === signinPassword
    );

    if (loggedUser) {
      setCurrentUser(loggedUser);
      triggerToast(`Welcome back, ${loggedUser.firstname}!`);
      setSigninEmail('');
      setSigninPassword('');
      navigateTo('home');
    } else {
      triggerToast("Invalid email or password credentials. Please retry!");
    }
  };

  // User Sign Out action
  const handleSignOut = () => {
    setCurrentUser(null);
    triggerToast("Logged out successfully.");
    navigateTo('home');
  };

  // Contact Form submit response
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast(`Message sent successfully. Thank you, ${contactName}!`);
    setContactName('');
    setContactEmail('');
    setContactSubject('');
    setContactMsg('');
  };

  // Menu Sorting & Filtering
  let filteredMenu = [...menu];
  if (selectedCategory !== 'All') {
    filteredMenu = filteredMenu.filter(m => m.category === selectedCategory);
  }
  if (searchQuery.trim() !== '') {
    const s = searchQuery.toLowerCase();
    filteredMenu = filteredMenu.filter(
      m => m.name.toLowerCase().includes(s) || m.description.toLowerCase().includes(s)
    );
  }
  if (sortBy === 'price-low') {
    filteredMenu.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredMenu.sort((a, b) => b.price - a.price);
  }

  // Admin section triggers
  const handleStartEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewMealName(item.name);
    setNewMealCategory(item.category);
    setNewMealDesc(item.description);
    setNewMealPrice(item.price.toString());
    setNewMealImage(item.image);
    setIsAdminItemModalOpen(true);
  };

  const handleStartAddItem = () => {
    setEditingItem(null);
    setNewMealName('');
    setNewMealCategory('Main Dishes');
    setNewMealDesc('');
    setNewMealPrice('');
    setNewMealImage('');
    setIsAdminItemModalOpen(true);
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenu(prev => prev.map(m => m.id === itemId ? {
      ...m,
      available: m.available === false ? true : false
    } : m));
    setTimeout(() => {
      setMenu(currentMenu => {
        const item = currentMenu.find(m => m.id === itemId);
        if (item) {
          const statusText = item.available !== false ? "In Stock / Available" : "Sold Out / Unavailable";
          triggerToast(`"${item.name}" availability updated to: ${statusText}`);
        }
        return currentMenu;
      });
    }, 50);
  };

  const handleSaveCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMealName || !newMealDesc || !newMealPrice || !newMealImage) {
      triggerToast("Please fill all properties for catalog validation.");
      return;
    }

    const priceNum = parseInt(newMealPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      triggerToast("Provide a valid numeric pricing greater than zero.");
      return;
    }

    if (editingItem) {
      setMenu(prev => prev.map(m => m.id === editingItem.id ? {
        ...m,
        name: newMealName,
        category: newMealCategory,
        description: newMealDesc,
        price: priceNum,
        image: newMealImage
      } : m));
      triggerToast(`Meal: ${newMealName} successfully updated in the menu!`);
    } else {
      const newItem: MenuItem = {
        id: `custom-${Date.now()}`,
        name: newMealName,
        category: newMealCategory,
        description: newMealDesc,
        price: priceNum,
        image: newMealImage,
        customizable: false,
        available: true
      };
      setMenu(prev => [...prev, newItem]);
      triggerToast(`New meal: ${newMealName} successfully added to standard menu!`);
    }

    // Reset Admin Modal values
    setNewMealName('');
    setNewMealDesc('');
    setNewMealPrice('');
    setNewMealImage('');
    setEditingItem(null);
    setIsAdminItemModalOpen(false);
  };

  const handleDeleteCatalogItem = (itemId: string, name: string) => {
    setMenu(prev => prev.filter(m => m.id !== itemId));
    triggerToast(`Removed "${name}" from standard menu database.`);
  };

  const handleDeleteUserAccount = (email: string, name: string) => {
    setUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    triggerToast(`Disabled and removed student account: ${name}`);
  };

  const updateOrderStatus = (orderId: string, nextStatus: Order['status']) => {
    setOrders(prev => {
      return prev.map(order => {
        if (order.orderId === orderId) {
          return {
            ...order,
            status: nextStatus
          };
        }
        return order;
      });
    });
    triggerToast(`Order ${orderId} updated to state: ${nextStatus}`);
  };

  // Calculations for Admin summaries with exact financial aggregates
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalActiveUsersCount = users.length;
  const totalReceivedOrdersCount = orders.length;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col antialiased font-sans selection:bg-amber-100 selection:text-amber-800">
      
      {/* FIXED TOP NAVIGATION BAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 fixed top-0 w-full z-45 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 font-sans">
            
            {/* Logo */}
            <div 
              onClick={() => navigateTo('home')} 
              className="flex items-center space-x-2.5 cursor-pointer group"
              id="nav-logo-btn"
            >
              <div className="bg-gradient-to-tr from-amber-500 to-amber-600 p-2.5 rounded-xl shadow-md shadow-amber-500/10 text-white transition-transform group-hover:scale-105">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                Campus Foods
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 font-semibold">
              <button 
                onClick={() => navigateTo('home')} 
                className={`flex items-center gap-1.5 transition text-sm cursor-pointer hover:text-amber-600 border-0 bg-transparent ${currentSection === 'home' ? 'text-amber-600 font-extrabold' : 'text-slate-600'}`}
              >
                <Home className="w-4 h-4" /> Home
              </button>
              <button 
                onClick={() => navigateTo('menu')} 
                className={`flex items-center gap-1.5 transition text-sm cursor-pointer hover:text-amber-600 border-0 bg-transparent ${currentSection === 'menu' ? 'text-amber-600 font-extrabold' : 'text-slate-600'}`}
              >
                <Utensils className="w-4 h-4" /> Menu
              </button>
              <button 
                onClick={() => navigateTo('about')} 
                className="flex items-center gap-1.5 transition text-sm text-slate-600 cursor-pointer hover:text-amber-600 border-0 bg-transparent"
              >
                <Info className="w-4 h-4" /> About Us
              </button>
              <button 
                onClick={() => navigateTo('contact')} 
                className="flex items-center gap-1.5 transition text-sm text-slate-600 cursor-pointer hover:text-amber-600 border-0 bg-transparent"
              >
                <Phone className="w-4 h-4" /> Contact
              </button>

              {/* Protected Administration Link */}
              {currentUser && currentUser.role === 'admin' && (
                <button 
                  onClick={() => navigateTo('admin')}
                  className={`flex items-center gap-1.5 transition text-xs font-bold bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-amber-100 border-solid ${currentSection === 'admin' ? 'text-amber-700 border-amber-300' : 'text-amber-800'}`}
                  id="nav-admin-panel-btn"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Panel
                </button>
              )}
            </div>

            {/* User Interaction and Cart Button Actions */}
            <div className="flex items-center space-x-3">
              
              {/* Cart Drawer Trigger Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-slate-605 hover:text-amber-600 hover:bg-slate-50 rounded-xl transition cursor-pointer border-0 bg-transparent"
                id="header-cart-btn"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Authentication segment display */}
              <div className="flex items-center space-x-1.5 font-semibold">
                {currentUser ? (
                  <div 
                    onClick={() => navigateTo('profile')}
                    className="flex items-center space-x-2 bg-slate-50 border border-slate-200 hover:border-amber-400 py-1.5 px-3 rounded-2xl cursor-pointer transition border-solid"
                    id="profile-nav-trigger"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-sm">
                      {`${currentUser.firstname.charAt(0)}${currentUser.lastname.charAt(0)}`.toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block font-extrabold text-slate-800 text-xs sm:text-sm">
                      {currentUser.firstname}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => navigateTo('signin')} 
                      className="hidden sm:inline-flex text-slate-600 hover:text-amber-600 font-bold px-3 py-2 text-sm transition cursor-pointer border-0 bg-transparent"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => navigateTo('signup')}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition shadow-sm shadow-amber-500/10 cursor-pointer border-0"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Mobile Hamburger Drawer Icon */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-amber-600 rounded-lg transition border-0 bg-transparent"
                id="mobile-hamburg-btn"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-2 shadow-lg overflow-hidden font-sans border-solid"
              id="mobile-nav-panel"
            >
              <button 
                onClick={() => navigateTo('home')} 
                className="w-full text-left font-semibold text-slate-700 hover:text-amber-600 py-2.5 flex items-center gap-2 border-0 bg-transparent"
              >
                <Home className="w-5 h-5 text-slate-400" /> Home
              </button>
              <button 
                onClick={() => navigateTo('menu')} 
                className="w-full text-left font-semibold text-slate-700 hover:text-amber-600 py-2.5 flex items-center gap-2 border-0 bg-transparent"
              >
                <Utensils className="w-5 h-5 text-slate-400" /> Menu Catalog
              </button>
              <button 
                onClick={() => navigateTo('about')} 
                className="w-full text-left font-semibold text-slate-700 hover:text-amber-600 py-2.5 flex items-center gap-2 border-0 bg-transparent"
              >
                <Info className="w-5 h-5 text-slate-400" /> About Culinary story
              </button>
              <button 
                onClick={() => navigateTo('contact')} 
                className="w-full text-left font-semibold text-slate-700 hover:text-amber-600 py-2.5 flex items-center gap-2 border-0 bg-transparent"
              >
                <Phone className="w-5 h-5 text-slate-400" /> Get in Touch
              </button>
              
              {currentUser && currentUser.role === 'admin' && (
                <button 
                  onClick={() => navigateTo('admin')} 
                  className="w-full text-left font-bold text-amber-700 hover:text-amber-800 py-2.5 flex items-center gap-2 border-t border-slate-100 mt-2 pt-2 border-solid bg-transparent"
                >
                  <Shield className="w-5 h-5 text-amber-500" /> Admin Control Panel
                </button>
              )}

              {!currentUser && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 border-solid">
                  <button 
                    onClick={() => navigateTo('signin')}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-center border border-slate-200 text-sm border-solid cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => navigateTo('signup')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-center text-sm border-0 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MAIN LAYOUT WRAPPERS */}
      <main className="flex-grow pt-16 sm:pt-20">

        {/* ================= PAGE 1: HOME LANDING PAGE ================= */}
        {currentSection === 'home' && (
          <HomeSection 
            menu={menu}
            favoriteMealIds={favoriteMealIds}
            cardQuantities={cardQuantities}
            toggleFavoriteMeal={toggleFavoriteMeal}
            navigateTo={navigateTo}
            showCustomizerModal={showCustomizerModal}
            adjustCardPortionQty={adjustCardPortionQty}
            addCardItemToCart={addCardItemToCart}
            contactName={contactName}
            setContactName={setContactName}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactSubject={contactSubject}
            setContactSubject={setContactSubject}
            contactMsg={contactMsg}
            setContactMsg={setContactMsg}
            handleContactSubmit={handleContactSubmit}
          />
        )}

        {/* ================= PAGE 2: INTERACTIVE MENU & ORDERING ================= */}
        {currentSection === 'menu' && (
          <MenuSection 
            filteredMenu={filteredMenu}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            cardQuantities={cardQuantities}
            favoriteMealIds={favoriteMealIds}
            toggleFavoriteMeal={toggleFavoriteMeal}
            showCustomizerModal={showCustomizerModal}
            adjustCardPortionQty={adjustCardPortionQty}
            addCardItemToCart={addCardItemToCart}
          />
        )}

        {/* ================= PAGE 3: SIGN IN ================= */}
        {currentSection === 'signin' && (
          <SignInSection 
            signinEmail={signinEmail}
            setSigninEmail={setSigninEmail}
            signinPassword={signinPassword}
            setSigninPassword={setSigninPassword}
            handleSignInSubmit={handleSignInSubmit}
            navigateTo={navigateTo}
          />
        )}

        {/* ================= PAGE 4: SIGN UP ================= */}
        {currentSection === 'signup' && (
          <SignUpSection 
            signupFname={signupFname}
            setSignupFname={setSignupFname}
            signupLname={signupLname}
            setSignupLname={setSignupLname}
            signupGender={signupGender}
            setSignupGender={setSignupGender}
            signupEmail={signupEmail}
            setSignupEmail={setSignupEmail}
            signupPhone={signupPhone}
            setSignupPhone={setSignupPhone}
            signupPassword={signupPassword}
            setSignupPassword={setSignupPassword}
            handleSignUpSubmit={handleSignUpSubmit}
            navigateTo={navigateTo}
          />
        )}

        {/* ================= PAGE 5: USER PROFILE & DASHBOARD ================= */}
        {currentSection === 'profile' && currentUser && (
          <ProfileSection 
            currentUser={currentUser}
            orders={orders}
            menu={menu}
            favoriteMealIds={favoriteMealIds}
            toggleFavoriteMeal={toggleFavoriteMeal}
            navigateTo={navigateTo}
            showCustomizerModal={showCustomizerModal}
            addCardItemToCart={addCardItemToCart}
            handleSignOut={handleSignOut}
          />
        )}

        {/* ================= PAGE 6: ADMIN DASHBOARD ================= */}
        {currentSection === 'admin' && currentUser && currentUser.role === 'admin' && (
          <AdminSection 
            currentUser={currentUser}
            orders={orders}
            menu={menu}
            users={users}
            totalRevenue={totalRevenue}
            totalReceivedOrdersCount={totalReceivedOrdersCount}
            totalActiveUsersCount={totalActiveUsersCount}
            handleStartAddItem={handleStartAddItem}
            handleStartEditItem={handleStartEditItem}
            handleToggleAvailability={handleToggleAvailability}
            updateOrderStatus={updateOrderStatus}
            handleDeleteCatalogItem={handleDeleteCatalogItem}
            handleDeleteUserAccount={handleDeleteUserAccount}
          />
        )}

      </main>

      {/* FOOTER segment */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 shrink-0 text-center text-xs font-semibold px-4 border-solid">
        <p>&copy; 2026 Campus Foods. Crafted securely and polished for campus catering. • ogtonero@gmail.com</p>
      </footer>

      {/* ================= RIGHT SIDE PANEL: SLIDE-OVER SHOPPING CART ================= */}
      <CartDrawer 
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        cart={cart}
        cartSubtotal={cartSubtotal}
        currentUser={currentUser}
        setIsCheckoutOpen={setIsCheckoutOpen}
        updateCartQuantity={updateCartQuantity}
        removeCartItem={removeCartItem}
        navigateTo={navigateTo}
      />

      {/* ================= DIALOG MODALS ================= */}

      {/* Modal 1: Add Custom Toppings Option Dialog */}
      <CustomizerModal 
        selectedCustomItem={selectedCustomItem}
        setSelectedCustomItem={setSelectedCustomItem}
        selectedCustomExtras={selectedCustomExtras}
        toggleSelectOption={toggleSelectOption}
        modalQty={modalQty}
        setModalQty={setModalQty}
        handleAddCustomizedToCart={handleAddCustomizedToCart}
      />

      {/* Modal 2: Simulated Checkout & Payments Gateway Dialog */}
      <CheckoutModal 
        isCheckoutOpen={isCheckoutOpen}
        setIsCheckoutOpen={setIsCheckoutOpen}
        orders={orders}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        deliveryAddress={deliveryAddress}
        setDeliveryAddress={setDeliveryAddress}
        bankRefCode={bankRefCode}
        setBankRefCode={setBankRefCode}
        cartSubtotal={cartSubtotal}
        checkoutDeliveryFee={checkoutDeliveryFee}
        checkoutGrandTotal={checkoutGrandTotal}
        handlePlaceOrder={handlePlaceOrder}
      />

      {/* Modal 3: Add/Edit Custom Catalog Items (Admin Only) */}
      <AdminItemModal 
        isAdminItemModalOpen={isAdminItemModalOpen}
        setIsAdminItemModalOpen={setIsAdminItemModalOpen}
        editingItem={editingItem}
        newMealName={newMealName}
        setNewMealName={setNewMealName}
        newMealCategory={newMealCategory}
        setNewMealCategory={setNewMealCategory}
        newMealPrice={newMealPrice}
        setNewMealPrice={setNewMealPrice}
        newMealDesc={newMealDesc}
        setNewMealDesc={setNewMealDesc}
        newMealImage={newMealImage}
        setNewMealImage={setNewMealImage}
        handleSaveCatalogItem={handleSaveCatalogItem}
      />

      {/* ================= NOTIFICATION TOAST POPUP ================= */}
      <Toast 
        isVisible={isToastVisible}
        message={toastMessage}
      />

    </div>
  );
}
