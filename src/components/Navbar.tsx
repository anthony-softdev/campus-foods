import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Phone, Info, Home, Utensils, User, LogOut } from 'lucide-react';
import { ViewType, UserProfile } from '../types';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  cartCount: number;
  currentUser: UserProfile | null;
  onSignOut: () => void;
}

export default function Navbar({ currentView, onNavigate, cartCount, currentUser, onSignOut }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = () => {
    setIsMobileMenuOpen(false);
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
    onNavigate('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAboutUsClick = () => {
    setIsMobileMenuOpen(false);
    onNavigate('home');
    setTimeout(() => {
      const element = document.getElementById('about-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleContactClick = () => {
    setIsMobileMenuOpen(false);
    onNavigate('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (view: ViewType) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white border-b border-gray-100 ${
      isScrolled ? 'shadow-sm py-3' : 'py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* LOGO */}
          <div 
            onClick={handleHomeClick} 
            className="flex items-center space-x-2 cursor-pointer group select-none"
            id="nav-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
              <Utensils size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">
              <span className="text-[#1a1a1a]">Campus</span>
              <span className="text-brand-orange"> Foods</span>
            </span>
          </div>

          {/* DESKTOP NAV LINKS (CENTER) */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={handleHomeClick}
              className={`relative font-sans font-semibold text-[15px] py-2 transition-all duration-200 cursor-pointer ${
                currentView === 'home'
                  ? 'text-brand-orange' 
                  : 'text-gray-600 hover:text-brand-orange'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Home size={15} />
                Home
              </span>
              {currentView === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-full" />
              )}
            </button>

            <button
              onClick={handleMenuClick}
              className={`relative font-sans font-semibold text-[15px] py-2 transition-all duration-200 cursor-pointer ${
                currentView === 'menu'
                  ? 'text-brand-orange' 
                  : 'text-gray-600 hover:text-brand-orange'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Utensils size={15} />
                Menu
              </span>
              {currentView === 'menu' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-full" />
              )}
            </button>

            <button
              onClick={handleAboutUsClick}
              className="relative font-sans font-semibold text-[15px] py-2 transition-all duration-200 cursor-pointer text-gray-600 hover:text-brand-orange"
            >
              <span className="flex items-center gap-1.5">
                <Info size={15} />
                About Us
              </span>
            </button>

            <button
              onClick={handleContactClick}
              className={`relative font-sans font-semibold text-[15px] py-2 transition-all duration-200 cursor-pointer ${
                currentView === 'contact'
                  ? 'text-brand-orange' 
                  : 'text-gray-600 hover:text-brand-orange'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Phone size={15} />
                Contact
              </span>
              {currentView === 'contact' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-full" />
              )}
            </button>
          </div>

          {/* RIGHT CTA ELEMENTS */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon Outline Container */}
            <button
              onClick={() => handleLinkClick('cart')}
              className="relative p-2 text-gray-600 hover:text-brand-orange border border-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-extrabold leading-none text-white bg-brand-orange rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-xs font-sans font-medium">
                  Hi, <span className="font-semibold text-gray-800">{currentUser.firstName}</span>
                </span>
                <button
                  onClick={() => handleLinkClick(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                  className="bg-orange-50 text-brand-orange hover:bg-orange-100 font-sans font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {currentUser.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                </button>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-400 border border-gray-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleLinkClick('auth')}
                className="bg-brand-orange hover:bg-[#e07f00] text-white font-bold px-5 py-2.5 rounded-full text-sm transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Cart Icon on mobile */}
            <button
              onClick={() => handleLinkClick('cart')}
              className="relative p-2 text-gray-600 hover:text-brand-orange border border-gray-200 rounded-xl transition-colors cursor-pointer mr-1"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-extrabold leading-none text-white bg-brand-orange rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-brand-orange focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-3 pb-6 space-y-2">
            <button
              onClick={handleHomeClick}
              className={`w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-semibold text-base transition-colors ${
                currentView === 'home' ? 'bg-orange-50 text-brand-orange' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home size={18} />
              <span className="truncate">Home</span>
            </button>

            <button
              onClick={handleMenuClick}
              className={`w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-semibold text-base transition-colors ${
                currentView === 'menu' ? 'bg-orange-50 text-brand-orange' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Utensils size={18} />
              <span className="truncate">Menu</span>
            </button>

            <button
              onClick={handleAboutUsClick}
              className="w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-semibold text-base transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Info size={18} />
              <span className="truncate">About Us</span>
            </button>

            <button
              onClick={handleContactClick}
              className={`w-full text-left flex items-center gap-2 px-4 py-3 rounded-xl font-sans font-semibold text-base transition-colors ${
                currentView === 'contact' ? 'bg-orange-50 text-brand-orange' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Phone size={18} />
              <span className="truncate">Contact</span>
            </button>

            {/* Mobile Auth State Actions */}
            <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
              {currentUser ? (
                <div className="px-4 space-y-3">
                  <p className="text-gray-500 text-sm font-sans truncate">
                    Signed in as <span className="font-semibold text-gray-800">{currentUser.fullName}</span>
                  </p>
                  <button
                    onClick={() => handleLinkClick(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                    className="w-full text-center bg-orange-50 text-brand-orange font-sans font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer block truncate"
                  >
                    {currentUser.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                  </button>
                </div>
              ) : (
                <div className="px-2">
                  <button
                    onClick={() => handleLinkClick('auth')}
                    className="w-full text-center bg-brand-orange text-white font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer truncate"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
