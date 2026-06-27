import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  Hash, 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserProfile, ViewType } from '../types';
import { auth, getUserProfileFromDb, saveUserProfileToDb, updateUserLastSeenInDb } from '../firebase';
import { HOSTELLOCATIONS } from '../data/menu';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile, isNewUser?: boolean) => void;
  onNavigate: (view: ViewType) => void;
}

export default function AuthView({ onAuthSuccess, onNavigate }: AuthViewProps): React.JSX.Element {
  // Feedback modal popup state
  const [showFeedbackModal, setShowFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    onClose?: () => void;
  } | null>(null);
  
  // Error / Success feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google sign in states
  const [googlePendingUser, setGooglePendingUser] = useState<{
    uid: string;
    email: string;
    fullName: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [googlePhone, setGooglePhone] = useState('');
  const [googleLocation, setGoogleLocation] = useState('');
  const [googleRoom, setGoogleRoom] = useState('');

  // Campus Hostel choices
  const nigeriaHostels = [
    ...HOSTELLOCATIONS.male.map((h) => h.label),
    ...HOSTELLOCATIONS.female.map((h) => h.label),
    ...HOSTELLOCATIONS.academic.map((h) => h.label),
    ...HOSTELLOCATIONS.other.map((h) => h.label),
  ];

  const handleGoogleSignIn = async () => {
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        throw new Error("Google account does not have an email associated.");
      }
      
      const existingProfile = await getUserProfileFromDb(user.email);
      
      if (existingProfile) {
        // Update last seen timestamp
        await updateUserLastSeenInDb(user.email);
        const updatedProfile = { ...existingProfile, lastSeen: new Date().toISOString() };
        localStorage.setItem('campus_foods_current_user', JSON.stringify(updatedProfile));
        
        setShowFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Successfully logged in 🔑',
          message: `Welcome back, ${updatedProfile.fullName}! Signing in with your Google account...`,
          onClose: () => {
            setIsSubmitting(false);
            onAuthSuccess(updatedProfile, false);
          }
        });
      } else {
        const fullName = user.displayName || 'Google User';
        const parts = fullName.split(' ');
        const firstName = parts[0] || 'Google';
        const lastName = parts.slice(1).join(' ') || 'User';
        
        setGooglePendingUser({
          uid: user.uid,
          email: user.email,
          fullName,
          firstName,
          lastName,
        });
        
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        const isUnauthorized = err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'));
        const customMsg = isUnauthorized
          ? `Google Sign In is not authorized on this domain (${window.location.hostname}). Setup is required in your Firebase Console.`
          : (err.message || 'Failed to authenticate with Google.');

        setErrorMsg(customMsg);
        setShowFeedbackModal({
          isOpen: true,
          type: 'error',
          title: isUnauthorized ? 'Firebase Setup Required 🔧' : 'Google Authentication Failed',
          message: isUnauthorized
            ? `This domain (${window.location.hostname}) is not yet authorized in your Firebase Project. Please follow the instructions on the screen to add it.`
            : (err.message || 'Failed to authenticate with Google. Please try again or use standard credentials.')
        });
      }
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googlePendingUser) return;
    
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');
    
    const newErrors: Record<string, string> = {};
    const cleanPhone = googlePhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      newErrors.googlePhone = "Phone number is required";
    } else if (!/^[0-9]{11}$/.test(cleanPhone)) {
      newErrors.googlePhone = "Phone number must be exactly 11 digits";
    }
    
    if (!googleLocation) {
      newErrors.googleLocation = "Please select a delivery location";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const profile: UserProfile = {
        email: googlePendingUser.email,
        firstName: googlePendingUser.firstName,
        lastName: googlePendingUser.lastName,
        fullName: googlePendingUser.fullName,
        phoneNumber: cleanPhone,
        deliveryLocation: googleLocation,
        roomNumber: googleRoom.trim() || 'N/A',
        role: 'student',
        lastSeen: new Date().toISOString(),
      };
      
      await saveUserProfileToDb(googlePendingUser.email, profile);
      
      localStorage.setItem('campus_foods_current_user', JSON.stringify(profile));
      
      setSuccessMsg('Profile completed successfully! Welcome to Campus Foods!');
      
      setShowFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Successfully logged in 🔑',
        message: `Welcome, ${profile.fullName}! Your campus foods profile has been created successfully. Let's make an order!`,
        onClose: () => {
          setIsSubmitting(false);
          setGooglePendingUser(null);
          onAuthSuccess(profile, true);
        }
      });
    } catch (err: any) {
      console.error('Google profile save error:', err);
      setErrorMsg('Failed to complete registration. Please check your network connection.');
      setShowFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Profile Registration Error',
        message: 'Failed to save your profile details. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  if (googlePendingUser) {
    return (
      <div id="auth-page-wrapper" className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 bg-[#f5f5f5] transition-all">
        <div id="auth-content-container" className="max-w-2xl mx-auto px-4 py-4 sm:py-8">
          
          <div className="text-center space-y-2 mb-6 sm:mb-8 animate-fade-in">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] text-center select-none px-2 leading-tight">
              Complete Your Profile 🌟
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm text-center max-w-sm mx-auto mt-2 leading-relaxed px-4">
              We just need a few quick student delivery details to secure your Campus Foods experience!
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100 max-w-lg mx-auto">
            <form onSubmit={handleGoogleRegistrationSubmit} className="space-y-4 sm:space-y-5">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-xs text-[#a05000] space-y-1">
                <p className="font-bold">Signing up as:</p>
                <p className="font-semibold text-gray-600 break-all">{googlePendingUser.fullName} ({googlePendingUser.email})</p>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                  PHONE NUMBER *
                </label>
                <div className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                  errors.googlePhone ? 'border-red-300 focus-within:ring-red-100' : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                }`}>
                  <Phone size={16} className="text-gray-300 ml-4 shrink-0" />
                  <input
                    type="tel"
                    required
                    placeholder="08113860805"
                    value={googlePhone}
                    onChange={(e) => {
                      setGooglePhone(e.target.value);
                      if (errors.googlePhone) setErrors(prev => { const d = {...prev}; delete d.googlePhone; return d; });
                    }}
                    className="flex-1 py-3 sm:py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300 w-full"
                  />
                </div>
                {errors.googlePhone && (
                  <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.googlePhone}
                  </p>
                )}
              </div>

              {/* Delivery Location */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                  DELIVERY LOCATION (HOSTEL/ACADEMIC) *
                </label>
                <div className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                  errors.googleLocation ? 'border-red-300 focus-within:ring-red-100' : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                }`}>
                  <MapPin size={16} className="text-gray-300 ml-4 shrink-0" />
                  <select
                    required
                    value={googleLocation}
                    onChange={(e) => {
                      setGoogleLocation(e.target.value);
                      if (errors.googleLocation) setErrors(prev => { const d = {...prev}; delete d.googleLocation; return d; });
                    }}
                    className="flex-1 py-3 sm:py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none cursor-pointer w-full"
                  >
                    <option value="">-- Choose Your Residence --</option>
                    {HOSTELLOCATIONS.male.length > 0 && (
                      <optgroup label="Male Hostels">
                        {HOSTELLOCATIONS.male.map((h) => (
                          <option key={h.value} value={h.label}>{h.label}</option>
                        ))}
                      </optgroup>
                    )}
                    {HOSTELLOCATIONS.female.length > 0 && (
                      <optgroup label="Female Hostels">
                        {HOSTELLOCATIONS.female.map((h) => (
                          <option key={h.value} value={h.label}>{h.label}</option>
                        ))}
                      </optgroup>
                    )}
                    {HOSTELLOCATIONS.academic.length > 0 && (
                      <optgroup label="Academic Blocks">
                        {HOSTELLOCATIONS.academic.map((h) => (
                          <option key={h.value} value={h.label}>{h.label}</option>
                        ))}
                      </optgroup>
                    )}
                    {HOSTELLOCATIONS.other.length > 0 && (
                      <optgroup label="Off-Campus & Offsite">
                        {HOSTELLOCATIONS.other.map((h) => (
                          <option key={h.value} value={h.label}>{h.label}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                {errors.googleLocation && (
                  <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.googleLocation}
                  </p>
                )}
              </div>

              {/* Room Number */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-1.5 block">
                  ROOM / SUITE NUMBER (OPTIONAL)
                </label>
                <div className="relative flex items-center border border-orange-200 rounded-2xl bg-white transition-all focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100">
                  <Hash size={16} className="text-gray-300 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. Room 204, Block B"
                    value={googleRoom}
                    onChange={(e) => setGoogleRoom(e.target.value)}
                    className="flex-1 py-3 sm:py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300 w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setGooglePendingUser(null)}
                  className="w-full sm:flex-1 py-3.5 sm:py-4 border border-gray-200 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer text-center"
                >
                  Cancel Sign In
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 bg-brand-orange hover:bg-[#e07f00] text-white font-bold py-3.5 sm:py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-200/60 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Complete Profile 🚀</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Feedback Modal Pop-up overlay */}
        <AnimatePresence>
          {showFeedbackModal?.isOpen && (
            <div className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-gray-150 relative space-y-4 font-sans"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {showFeedbackModal.type === 'success' ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-150 text-emerald-600 flex items-center justify-center text-xl font-bold">✓</div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-150 text-rose-500 flex items-center justify-center text-xl font-bold font-mono">!</div>
                  )}
                  <h3 className="font-display font-black text-base text-[#1a1a1a]">{showFeedbackModal.title}</h3>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed whitespace-pre-line">{showFeedbackModal.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const onCloseAction = showFeedbackModal.onClose;
                    setShowFeedbackModal(null);
                    if (onCloseAction) onCloseAction();
                  }}
                  className={`w-full py-3 rounded-2xl font-sans font-bold text-xs text-white shadow-lg transition-all cursor-pointer ${
                    showFeedbackModal.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                  }`}
                >
                  Okay, Understood
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div id="auth-page-wrapper" className="min-h-screen pt-24 pb-16 bg-[#f5f5f5] transition-all">
      <div id="auth-content-container" className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[#1a1a1a] text-center select-none break-words">
            Campus Account Hub 🔑
          </h1>
          <p className="text-gray-400 text-sm text-center max-w-sm mx-auto mt-2 leading-relaxed">
            Manage your student profiling details, tracks orders instantaneously, and save money with campus points!
          </p>
        </div>

        {/* Feedback Alerts */}
        <div className="mt-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs font-sans text-red-600 font-semibold animate-shake flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.includes('unauthorized-domain') && (
                <div className="p-3 bg-white border border-red-150 rounded-lg text-[11px] text-gray-700 font-normal space-y-2 leading-relaxed">
                  <p className="font-bold text-red-700">🔧 How to authorize this domain in Firebase Console:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                    <li>Open your <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline font-bold">Firebase Console</a>.</li>
                    <li>Go to <strong className="text-gray-800">Authentication</strong> &gt; <strong className="text-gray-800">Settings</strong> &gt; <strong className="text-gray-800">Authorized domains</strong>.</li>
                    <li>Click <strong className="text-gray-800">Add domain</strong> and add:</li>
                  </ol>
                  <div className="bg-gray-50 border border-gray-200 p-2 rounded font-mono text-[10px] text-gray-800 flex justify-between items-center select-all">
                    <span>{window.location.hostname}</span>
                    <span className="text-[9px] text-gray-400 font-sans">Double-click to copy</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">After saving, refresh this page and sign in again!</p>
                </div>
              )}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-sans text-emerald-600 font-semibold flex items-center gap-2 animate-pop-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>🎉 {successMsg}</span>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="font-display font-bold text-xl text-[#1a1a1a] mb-2 text-center">
            Sign In or Register
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            Use your Google account for a fast and secure login.
          </p>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-50 text-[#1a1a1a] border-2 border-gray-200 font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path fill="#4285F4" d="M23.64 12.204c0-.78-.07-1.53-.2-2.25H12v4.26h6.32c-.27 1.44-1.04 2.66-2.22 3.48v2.91h3.58c2.09-1.92 3.28-4.77 3.28-8.4z" />
              <path fill="#34A853" d="M12 24c2.97 0 5.47-0.98 7.29-2.65l-3.58-2.91c-.99.66-2.26 1.05-3.71 1.05-2.86 0-5.28-1.93-6.14-4.52H2.1v2.84C3.92 21.46 7.73 24 12 24z" />
              <path fill="#FBBC05" d="M5.86 14.97A7.99 7.99 0 0 1 5.5 12c0-1 .24-1.95.66-2.83V6.33H2.1A12.02 12.02 0 0 0 0 12c0 1.94.5 3.77 1.4 5.37l4.46-2.4z" />
              <path fill="#EA4335" d="M12 4.8c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.46 1.24 14.97 0 12 0 7.73 0 3.92 2.54 2.1 6.33l4.46 2.84C6.72 6.73 9.14 4.8 12 4.8z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

      </div>

      {/* Feedback Modal Pop-up overlay */}
      <AnimatePresence>
        {showFeedbackModal?.isOpen && (
          <div className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-gray-150 relative space-y-4 font-sans"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                {showFeedbackModal.type === 'success' ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-150 text-emerald-600 flex items-center justify-center text-xl font-bold">
                    ✓
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-150 text-rose-500 flex items-center justify-center text-xl font-bold font-mono">
                    !
                  </div>
                )}
                
                <h3 className="font-display font-black text-base text-[#1a1a1a]">
                  {showFeedbackModal.title}
                </h3>
                
                <p className="text-xs text-gray-500 font-semibold leading-relaxed whitespace-pre-line">
                  {showFeedbackModal.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const onCloseAction = showFeedbackModal.onClose;
                  setShowFeedbackModal(null);
                  if (onCloseAction) onCloseAction();
                }}
                className={`w-full py-3 rounded-2xl font-sans font-bold text-xs text-white shadow-lg transition-all cursor-pointer ${
                  showFeedbackModal.type === 'success'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                }`}
              >
                Okay, Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
