import { useState, useEffect } from 'react';
import { ArrowRight, Star, ShoppingBag, MapPin, Truck, HelpCircle, Flame, Utensils, Clock } from 'lucide-react';
import { MenuItem, CartItem, ViewType } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQuantity: (itemId: string, dQuantity: number) => void;
  menuItems: MenuItem[];
}

export default function HomeView({ onNavigate, cart, onAddToCart, onUpdateCartQuantity, menuItems }: HomeViewProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get 6-8 popular items
  const popularItems = menuItems.filter(item => item.popular);

  const getCartQuantity = (itemId: string) => {
    const found = cart.find(c => c.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const reviews = [
    {
      name: 'Chidi A.',
      initials: 'CA',
      role: 'Faculty of Architecture (300L)',
      text: 'Campus Foods is an absolute lifesaver! During exams, I don\'t have time to cook or trek to school gate. The Jollof Rice is always piping hot!',
      bg: 'bg-orange-100 text-orange-700',
      stars: 5
    },
    {
      name: 'Fatima B.',
      initials: 'FB',
      role: 'Moremi Hall resident',
      text: 'The Chapman drink is cold and tastes exactly like the ones they serve in top restaurants. Delivery is super fast, 10/10 recommended for hostel life!',
      bg: 'bg-amber-100 text-amber-700',
      stars: 5
    },
    {
      name: 'Tunde O.',
      initials: 'TO',
      role: 'Faculty of Sciences (400L)',
      text: 'Their customer service is incredible. Real quick delivery even during evening rain, and the Shawarma is gigantic filled with cream and chicken.',
      bg: 'bg-rose-100 text-rose-700',
      stars: 5
    }
  ];

  return (
    <div className="space-y-20 pb-16 animate-fadeIn">
      
      {/* HERO SECTION */}
      <section className="relative bg-[#fdf8ee] pt-28 pb-20 lg:py-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column — Text Content */}
            <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">

              {/* Main Headline */}
              <h1 id="hero-title" className="leading-tight select-none">
                <div className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1a1a1a]">
                  Your Ultimate
                </div>
                <div className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl bg-gradient-to-r from-brand-orange to-amber-500 bg-clip-text text-transparent mt-1 pb-1">
                  Campus Food Hub
                </div>
              </h1>
              
              {/* Subtext paragraph */}
              <p className="text-gray-500 text-sm font-sans leading-relaxed max-w-md mt-4">
                Enjoy piping-hot nutritious meals prepared with utmost health standards. Order easily and get swift delivery direct to your hostel doorway, class block, or department lecture room today.
              </p>
              
              {/* Two CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('menu')}
                  className="bg-brand-orange hover:bg-[#e07f00] text-white font-bold px-7 py-4 rounded-2xl text-sm shadow-lg shadow-orange-200 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  Explore Food Menu
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('about-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('contact');
                    }
                  }}
                  className="bg-white border-2 border-gray-200 hover:border-brand-orange text-gray-700 hover:text-brand-orange font-bold px-7 py-4 rounded-2xl text-sm transition-all cursor-pointer w-full sm:w-auto text-center"
                >
                  Our Kitchen Story
                </button>
              </div>

            </div>

            {/* Right Column — Food Image */}
            <div className="relative flex justify-center items-center">
              
              {/* Circular food image plate disc */}
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-white shadow-xl overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600" 
                  alt="Delicious food bowl plate" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute bottom-4 left-0 lg:-left-6 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                  <Clock size={16} />
                </div>
                <div className="text-left">
                  <div className="font-display font-bold text-sm text-[#1a1a1a]">
                    15-Min Delivery
                  </div>
                  <div className="text-[11px] text-gray-400 font-sans">
                    To hostels or lecture halls
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-orange font-bold text-xs uppercase tracking-wider font-sans bg-orange-100 px-3.5 py-1.5 rounded-full">Fast & Efficient Delivery Flow</span>
          <h2 className="text-3xl font-display font-extrabold text-[#1a1a1a] mt-3 leading-snug">How Campus Foods Works ⚡</h2>
          <p className="text-sm font-sans text-gray-500 mt-2">Hungry? We’ve simplified our hostel food delivery flow to get food to you in just three quick steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white border border-orange-100/60 p-8 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-orange-200/10 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-orange-100/70 flex items-center justify-center text-brand-orange mb-6 text-2xl group-hover:scale-110 transition-transform">
              🍽️
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#1a1a1a]">1. Browse Menu</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              Pick your favourite local Nigerian meals, fast food, street snacks, or chilled soft drinks in seconds.
            </p>
            <div className="absolute top-4 right-4 text-orange-200/25 font-display font-black text-5xl select-none">01</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-orange-100/60 p-8 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-orange-200/10 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-orange-100/70 flex items-center justify-center text-brand-orange mb-6 text-2xl group-hover:scale-110 transition-transform">
              📍
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#1a1a1a]">2. Select Location</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              Pinpoint your exact delivery point—all major Male Hostels, Female Hostels, academic faculties, and libraries.
            </p>
            <div className="absolute top-4 right-4 text-orange-200/25 font-display font-black text-5xl select-none">02</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-orange-100/60 p-8 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-orange-200/10 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-orange-100/70 flex items-center justify-center text-brand-orange mb-6 text-2xl group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-[#1a1a1a]">3. Fast Delivery</h3>
            <p className="text-sm font-sans text-gray-600 leading-relaxed">
              Our dispatch riders race against time to bring packaging directly to your hostel lobby or lecture room entrance.
            </p>
            <div className="absolute top-4 right-4 text-orange-200/25 font-display font-black text-5xl select-none">03</div>
          </div>

        </div>
      </section>

      {/* POPULAR FOODS / "STUDENTS LOVE THESE" */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="text-brand-orange font-bold text-xs uppercase tracking-wider font-sans flex items-center gap-1">
                <Flame size={14} className="fill-brand-orange text-brand-orange" />
                Crowd Favourites
              </span>
              <h2 className="text-3xl font-display font-extrabold text-[#1a1a1a] mt-1">Students Love These 🔥</h2>
              <p className="text-sm font-sans text-gray-500 mt-1">The most frequently ordered campus fuel. Ready, warm, and highly delicious.</p>
            </div>
            <button 
              onClick={() => onNavigate('menu')}
              className="text-brand-orange font-sans font-bold text-sm tracking-wide flex items-center gap-1 hover:gap-2 transition-all cursor-pointer bg-orange-50 hover:bg-orange-100 px-4 py-2.5 rounded-full"
            >
              See Full Menu
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Horizontal slider container for mobile / Grid on desktop */}
          <div className="flex overflow-x-auto pb-4 gap-6 custom-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible">
            {popularItems.slice(0, 8).map((item) => {
              const qty = getCartQuantity(item.id);
              return (
                <div 
                  key={item.id} 
                  className="min-w-[280px] sm:min-w-0 bg-white border border-orange-100/60 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-orange-200/25 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
                >
                  {/* Food Image */}
                  <div className="relative h-44 overflow-hidden bg-[#fff2e0]">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase bg-white/95 text-brand-orange rounded-lg shadow-sm">
                      🔥 Best Seller
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="font-display font-bold text-base text-[#1a1a1a] leading-tight group-hover:text-brand-orange transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 font-sans line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-orange-50">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">PRICE</span>
                        <span className="text-lg font-display font-extrabold text-[#1a1a1a]">₦{item.price.toLocaleString()}</span>
                      </div>

                      {/* Add to Cart Actions */}
                      {qty > 0 ? (
                        <div className="flex items-center bg-orange-50 border border-orange-100 rounded-2xl py-1.5 px-3">
                          <button
                            onClick={() => onUpdateCartQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-brand-orange hover:bg-brand-orange hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-sm font-bold font-sans text-brand-orange">
                            {qty}
                          </span>
                          <button
                            onClick={() => onUpdateCartQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white text-brand-orange hover:bg-brand-orange hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddToCart(item)}
                          className="bg-brand-orange hover:bg-[#e07f00] text-white py-2 px-4 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-orange-200 hover:scale-105 active:scale-95 text-xs font-bold font-sans flex items-center gap-1.5"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-brand-dark text-white rounded-3xl p-8 md:p-12 xl:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Texts */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-brand-orange font-bold text-xs uppercase tracking-widest font-sans px-3.5 py-1.5 rounded-full bg-orange-500/10 inline-block border border-orange-500/20">
                Behind Campus Foods
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
                Fueling Campus Life, One Hot Meal at a Time 🧡
              </h2>
              <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed">
                We are a campus-focused food delivery service connecting hungry students to their favourite local meals and fast foods inside the university. Founded by students who understand what standard hostel cooking tastes like, we source only from the cleanest, tastiest kitchens. 
              </p>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                Our mission is simple: provide quick, hygienic, extremely affordable, and reliable food delivery. Say goodbye to trekking under the hot sun or buying expensive taxi rides just to get lunch.
              </p>

              <button 
                onClick={() => onNavigate('contact')}
                className="mt-2 bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-bold px-7 py-3 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/10 hover:scale-105"
              >
                Get in Touch with Us 
              </button>
            </div>

            {/* Right Stats with unique design */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6 w-full max-w-sm">
                
                {/* Stat 1 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                  <div className="text-3xl md:text-4xl font-display font-extrabold text-brand-orange">500+</div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans mt-1">Orders Delivered</div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                  <div className="text-3xl md:text-4xl font-display font-extrabold text-brand-orange">30+</div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans mt-1">Menu Delicacies</div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                  <div className="text-3xl md:text-4xl font-display font-extrabold text-brand-orange">10+</div>
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold font-sans mt-1">Campus Locations</div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* REVIEWS / TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-brand-orange font-bold text-xs uppercase tracking-wider font-sans bg-orange-50 px-3 py-1 rounded-full">Student Stories</span>
          <h2 className="text-3xl font-display font-extrabold text-[#1a1a1a] mt-2">What Students Are Saying 💬</h2>
          <p className="text-sm font-sans text-gray-500 mt-2">Real reviews from students fueling their late-night reading sessions, class preps and hostel gatherings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-4">
                {/* Stars and decoration */}
                <div className="flex text-amber-500 gap-1">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-500" />
                  ))}
                </div>
                
                {/* Text */}
                <p className="text-sm font-sans text-gray-600 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Student Bio */}
              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-50">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm select-none ${rev.bg}`}>
                  {rev.initials}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-[#1a1a1a]">{rev.name}</h4>
                  <p className="text-[11px] font-sans text-gray-400 font-medium">{rev.role}</p>
                </div>
              </div>

              {/* Decorative quotation mark */}
              <div className="absolute top-6 right-8 text-6xl text-orange-100/40 font-serif leading-none select-none">“</div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating back-to-top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 w-11 h-11 bg-white hover:bg-orange-50 text-brand-orange border border-orange-100 rounded-full shadow-lg flex items-center justify-center transition-all hover:-translate-y-1 z-40 cursor-pointer text-xs animate-fadeIn"
          title="Back to Top"
        >
          ▲
        </button>
      )}

    </div>
  );
}
