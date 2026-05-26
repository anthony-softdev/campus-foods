import React from 'react';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Timer, 
  ArrowRight, 
  Heart, 
  Settings, 
  Minus, 
  Plus, 
  ChefHat, 
  Bike, 
  Phone, 
  Mail, 
  MapPin, 
  Send 
} from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem } from '../types';

interface HomeSectionProps {
  menu: MenuItem[];
  favoriteMealIds: string[];
  cardQuantities: Record<string, number>;
  toggleFavoriteMeal: (mealId: string) => void;
  navigateTo: (target: any) => void;
  showCustomizerModal: (item: MenuItem) => void;
  adjustCardPortionQty: (mealId: string, change: number) => void;
  addCardItemToCart: (item: MenuItem) => void;
  contactName: string;
  setContactName: (val: string) => void;
  contactEmail: string;
  setContactEmail: (val: string) => void;
  contactSubject: string;
  setContactSubject: (val: string) => void;
  contactMsg: string;
  setContactMsg: (val: string) => void;
  handleContactSubmit: (e: React.FormEvent) => void;
}

export default function HomeSection({
  menu,
  favoriteMealIds,
  cardQuantities,
  toggleFavoriteMeal,
  navigateTo,
  showCustomizerModal,
  adjustCardPortionQty,
  addCardItemToCart,
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactSubject,
  setContactSubject,
  contactMsg,
  setContactMsg,
  handleContactSubmit
}: HomeSectionProps) {
  return (
    <div id="home-section-container">
      {/* Hero Header Presentation space */}
      <header className="relative bg-gradient-to-b from-amber-50/70 to-white overflow-hidden py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> #1 Campus Food Service
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your Ultimate <br />
              <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                Campus Food Hub
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Enjoy piping-hot nutritious meals prepared with utmost health standards. Order easily and get swift delivery direct to your hostel doorway, class block, or department lecture room today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <button 
                onClick={() => navigateTo('menu')} 
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-md cursor-pointer shadow-amber-500/10 transition duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <UtensilsCrossed className="w-4 h-4" /> Explore Food Menu
              </button>
              <button 
                onClick={() => navigateTo('about')}
                className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold px-6 py-3.5 rounded-2xl border border-slate-200 transition duration-200 text-sm sm:text-base cursor-pointer"
              >
                Our Kitchen Story
              </button>
            </div>
          </div>

          {/* Imagery visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 overflow-hidden shadow-xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600" 
                alt="Gourmet Salad protein bowl" 
                className="w-full h-full object-cover transition duration-500 hover:scale-105"
              />
            </div>
            
            <div className="absolute -bottom-4 -left-2 bg-white p-3.5 rounded-2xl shadow-lg flex items-center gap-3 border border-slate-100">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                <Timer className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">15-Min Delivery</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">To hostels or lecture halls</p>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* Today's Special Selection segment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Today's Specials</h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Sourced from fresh local ingredients everyday in our kitchens</p>
          </div>
          <button 
            onClick={() => navigateTo('menu')} 
            className="text-amber-600 hover:text-amber-700 font-black text-sm flex items-center gap-1 transition group bg-transparent border-0 cursor-pointer"
          >
            View Menu Items ({menu.length}) <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Dynamic Featured specials Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.slice(0, 4).map(meal => {
            const currentQty = cardQuantities[meal.id] || 1;
            return (
              <div 
                key={meal.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between relative"
              >
                <div>
                  {/* Meal image wrapper */}
                  <div className="h-44 bg-slate-100 relative max-h-44 overflow-hidden">
                    <img src={meal.image} alt={meal.name} className={`w-full h-full object-cover transition duration-300 ${meal.available === false ? 'grayscale filter blur-2xs brightness-75' : ''}`} />
                    {meal.available === false && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-3xs flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border border-red-400 border-solid shadow-sm animate-pulse">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs font-bold text-slate-700 text-[10px] px-2.5 py-1 rounded-md shadow-sm border border-slate-100 border-solid">
                      {meal.category}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMeal(meal.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm border border-slate-100 hover:bg-white transition cursor-pointer text-rose-500 hover:scale-105 active:scale-95 border-solid bg-transparent"
                      title={favoriteMealIds.includes(meal.id) ? "Remove Favorite" : "Add to Favorites"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favoriteMealIds.includes(meal.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  </div>
                  {/* Meal metadata */}
                  <div className="p-4.5 space-y-1.5">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{meal.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">{meal.description}</p>
                  </div>
                </div>

                {/* Pricing row & direct add trigger */}
                <div className="p-4.5 border-t border-slate-100/80 bg-slate-50/30 flex items-center justify-between">
                  <span className="font-black text-slate-900 text-lg">₦{meal.price}</span>
                  {meal.available === false ? (
                    <button 
                      disabled
                      className="bg-slate-200 text-slate-400 border border-slate-300 border-solid font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-not-allowed uppercase tracking-wider"
                    >
                      Sold Out
                    </button>
                  ) : meal.customizable ? (
                    <button 
                      onClick={() => showCustomizerModal(meal)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer border-0"
                    >
                      Customize <Settings className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-6 h-8">
                        <button 
                          onClick={() => adjustCardPortionQty(meal.id, -1)}
                          className="px-1.5 h-full text-slate-500 hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1 text-[11px] font-black text-slate-800">{currentQty}</span>
                        <button 
                          onClick={() => adjustCardPortionQty(meal.id, 1)}
                          className="px-1.5 h-full text-slate-500 hover:bg-slate-50 transition cursor-pointer border-0 bg-transparent"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => addCardItemToCart(meal)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-2.5 py-1.5 rounded-xl text-xs transition cursor-pointer border-0"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Brand Values Segment container */}
      <section className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex flex-col items-center text-center p-4 space-y-2.5">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <ChefHat className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950">Expert Chefs</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-xs">
              Utmost hygienic preparation methods ensuring absolute health compliance in every order.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-2.5">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <Bike className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950">Swift Delivery</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-xs">
              Punctual campus couriers who navigate shortcut corridors to serve your meal hot and fresh.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 space-y-2.5">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-950">Pocket Friendly</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-xs">
              Specially optimized retail prices designed to scale well with average student dining budgets.
            </p>
          </div>

        </div>
      </section>

      {/* About story section */}
      <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Our Story</h2>
        <div className="space-y-4 text-slate-600 leading-relaxed font-semibold text-sm sm:text-base">
          <p>
            At Campus Foods, we are dedicated to streamlining quality retail cooking directly inside your campus community. Born in the heart of university life, we understands that dynamic lecture schedules leave little room for healthy food preps.
          </p>
          <p>
            We collaborate with premium culinary cooks to source local produce daily. Every serving of Jollof, Chicken fries, or specialty Egusi soup meets rigorous quality guidelines to satisfy both your taste expectations and pockets.
          </p>
        </div>
      </section>

      {/* Contact Information & Feedback forms */}
      <section id="contact" className="bg-slate-100 border-t border-slate-200/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact text */}
          <div className="lg:col-span-5 space-y-6 self-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Get in Touch</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                Need hostel partnerships, quick catering events, or menu suggestions? Contact team Campus Foods now.
              </p>
            </div>
            
            <div className="space-y-3 font-semibold text-slate-700 text-xs sm:text-sm">
              <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-slate-200/50 shadow-xs">
                <Phone className="text-amber-500 w-4 h-4 shrink-0" />
                <a href="tel:+2348037667982" className="hover:text-amber-600 transition">+234 (803) 766-7982</a>
              </div>
              <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-slate-200/50 shadow-xs">
                <Mail className="text-amber-500 w-4 h-4 shrink-0" />
                <a href="mailto:info@campusfoods.com" className="hover:text-amber-600 transition">info@campusfoods.com</a>
              </div>
              <div className="flex items-center gap-3.5 bg-white p-3.5 rounded-2xl border border-slate-200/50 shadow-xs">
                <MapPin className="text-amber-500 w-4 h-4 shrink-0" />
                <span>Campus Dining Hall, Main University Campus, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Contact form Submission */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-md">
            <h3 className="text-lg font-extrabold mb-5 text-slate-900">Send us a Message</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Anthony"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="tony@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Message Subject</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Catering for Hostel Hall 4"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Message</label>
                <textarea 
                  rows={3} 
                  required 
                  placeholder="Tell us what you need..."
                  value={contactMsg}
                  onChange={(e) => setContactMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-sm shadow-md shadow-amber-500/10 cursor-pointer border-0"
              >
                <Send className="w-3.5 h-3.5" /> Submit Question
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
