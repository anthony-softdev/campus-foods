import { Utensils, Instagram, MessageCircle, Heart } from 'lucide-react';
import { UserProfile, ViewType } from '../types';

interface FooterProps {
  onNavigate: (view: ViewType) => void;
  currentUser: UserProfile | null;
}

export default function Footer({ onNavigate, currentUser }: FooterProps) {
  const handleLinkClick = (view: ViewType) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-dark text-gray-400 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1.5 space-y-4">
            <div 
              onClick={() => handleLinkClick('home')} 
              className="flex items-center space-x-2 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center text-brand-orange">
                <Utensils size={18} />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight">
                <span className="text-white">Campus</span>
                <span className="text-brand-orange">Foods</span>
                <span className="text-brand-orange ml-1">🍽️</span>
              </span>
            </div>
            
            <p className="text-sm font-sans leading-relaxed text-gray-400">
              Fueling Campus Life, One Meal at a Time. Get hot local Nigerian delicacies and fast foods delivered directly to your hostel lobby or lecture room in minutes!
            </p>
            
            <div className="text-xs text-orange-400/80 font-mono tracking-wider font-semibold">
              🔥 HOTLINE: 08113860805
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-display font-bold text-base mb-4 tracking-wide uppercase text-xs">Navigation</h3>
            <ul className="space-y-3 font-sans text-sm">
              <li>
                <button 
                  onClick={() => handleLinkClick('home')} 
                  className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('menu')} 
                  className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                >
                  Tasty Menu
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('cart')} 
                  className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                >
                  My Cart
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('contact')} 
                  className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                >
                  Support & Contact
                </button>
              </li>
              {currentUser?.role === 'admin' && (
                <li>
                  <button 
                    onClick={() => handleLinkClick('admin')} 
                    className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                  >
                    Admin Panel
                  </button>
                </li>
              )}
              <li>
                <button 
                  onClick={() => handleLinkClick('terms')} 
                  className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('privacy')} 
                  className="hover:text-brand-orange cursor-pointer transition-colors duration-200 block text-left w-full"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="text-sm font-sans">
            <h3 className="text-white font-display font-bold text-base mb-4 tracking-wide uppercase text-xs">Delivery Hours</h3>
            <p className="text-gray-300 leading-normal mb-2 font-semibold">Every Single Day</p>
            <p className="text-xs text-gray-500 mb-4">08:00 AM — 11:30 PM</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Accepting Orders Online
            </span>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-display font-bold text-base mb-4 tracking-wide uppercase text-xs">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://instagram.com/campusfoods" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 text-gray-300 hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://x.com/campusfoods" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 text-gray-300 hover:bg-brand-orange hover:text-white flex items-center justify-center transition-all duration-300"
              >
                {/* SVG/Styled X icon since it replaces Twitter */}
                <span className="font-extrabold text-sm select-none font-display">X</span>
              </a>
              <a 
                href="https://wa.me/2348113860805?text=Hello%20Campus%20Foods!%20I%20need%20help%20with%20my%20order." 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 text-gray-300 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-300"
              >
                <MessageCircle size={18} />
              </a>
            </div>
            <p className="text-xs text-gray-500 leading-normal">
              Need immediate help? Reach out on our WhatsApp support line for prompt manual order sorting.
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-800 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-gray-500">
          <p>© 2026 Campus Foods Ltd. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart size={12} className="text-brand-orange fill-brand-orange" /> for Nigerian University Students
          </p>
        </div>
      </div>
    </footer>
  );
}
