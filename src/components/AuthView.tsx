import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  Hash, 
  Shield, 
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import bcrypt from 'bcryptjs';
import { UserProfile } from '../types';
import { auth, getUserProfileFromDb, saveUserProfileToDb } from '../firebase';
import { HOSTELLOCATIONS } from '../data/menu';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile, isNewUser?: boolean) => void;
  onNavigate: (view: any, authTab?: 'signin' | 'signup') => void;
  initialTab?: 'signin' | 'signup';
  key?: string | number;
}

export default function AuthView({ onAuthSuccess, onNavigate, initialTab = 'signin' }: AuthViewProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Feedback modal popup state
  const [showFeedbackModal, setShowFeedbackModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    onClose?: () => void;
  } | null>(null);
  
  // Password visibility states
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirmPass, setShowSignupConfirmPass] = useState(false);
  const [showResetPass, setShowResetPass] = useState(false);
  const [showConfirmResetPass, setShowConfirmResetPass] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  
  // Forgot Password inputs
  const [resetPhone, setResetPhone] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [foundUserForReset, setFoundUserForReset] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign Up inputs
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupRoom, setSignupRoom] = useState('');

  // Admin registration / staff toggle
  const [isStaffOpen, setIsStaffOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  
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

  const handleTabChange = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');
    setIsForgotPassword(false);
    setResetStep(1);
    setResetPhone('');
    setFoundUserForReset(null);
    setNewPassword('');
    setConfirmNewPassword('');
    setGooglePendingUser(null);
    setGooglePhone('');
    setGoogleLocation('');
    setGoogleRoom('');
  };

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
        localStorage.setItem('campus_foods_current_user', JSON.stringify(existingProfile));
        
        setShowFeedbackModal({
          isOpen: true,
          type: 'success',
          title: 'Successfully logged in 🔑',
          message: `Welcome back, ${existingProfile.fullName}! Signing in with your Google account...`,
          onClose: () => {
            setIsSubmitting(false);
            onAuthSuccess(existingProfile, false);
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
        role: 'student'
      };
      
      await saveUserProfileToDb(googlePendingUser.email, profile);
      
      const usersJson = localStorage.getItem('campus_foods_users') || '[]';
      let users = JSON.parse(usersJson);
      users = users.filter((u: any) => u.email.toLowerCase().trim() !== googlePendingUser.email.toLowerCase().trim());
      users.push({
        ...profile,
        password: '',
      });
      localStorage.setItem('campus_foods_users', JSON.stringify(users));
      
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');

    const newErrors: Record<string, string> = {};
    if (!loginEmail.trim()) {
      newErrors.loginEmail = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      newErrors.loginEmail = "Enter a valid email address";
    }
    if (!loginPassword) {
      newErrors.loginPassword = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const trimmedEmail = loginEmail.toLowerCase().trim();
    let profile: UserProfile | null = null;

    const ADMIN_EMAIL = (import.meta as any).env.VITE_ADMIN_EMAIL || 'admin@unikitchen.com';
    const ADMIN_PASSWORD = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'adminpassword';

    // Check for admin credentials
    if (trimmedEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
      profile = {
        email: ADMIN_EMAIL,
        firstName: 'System',
        lastName: 'Administrator',
        fullName: 'System Admin Manager',
        phoneNumber: '08113860805',
        deliveryLocation: 'SUB Block A/B (Commercial Hub)',
        roomNumber: 'Admin Suite 1',
        role: 'admin'
      };
    } else {
      try {
        // Query Firestore
        let foundUser = await getUserProfileFromDb(trimmedEmail);

        // Fallback to localStorage accounts database
        if (!foundUser) {
          const localUsersStr = localStorage.getItem('campus_foods_users');
          if (localUsersStr) {
            const localUsers = JSON.parse(localUsersStr);
            foundUser = localUsers.find((u: any) => u.email.toLowerCase().trim() === trimmedEmail);
          }
        }

        if (!foundUser) {
          setErrorMsg('Invalid credentials. Check email or password and try again.');
          setIsSubmitting(false);
          return;
        }

        const isMatch = await bcrypt.compare(loginPassword, foundUser.password);
        if (!isMatch) {
          setErrorMsg('Invalid credentials. Check email or password and try again.');
          setIsSubmitting(false);
          return;
        }

        profile = {
          email: foundUser.email,
          firstName: foundUser.firstName || foundUser.fullName.split(' ')[0] || '',
          lastName: foundUser.lastName || foundUser.fullName.split(' ').slice(1).join(' ') || '',
          fullName: foundUser.fullName,
          phoneNumber: foundUser.phoneNumber,
          deliveryLocation: foundUser.deliveryLocation,
          roomNumber: foundUser.roomNumber,
          role: foundUser.role || 'student'
        };
      } catch (err) {
        console.error('Login error:', err);
        setErrorMsg('Error connecting to database. Please check connection and try again.');
        setIsSubmitting(false);
        return;
      }
    }

    localStorage.setItem('campus_foods_current_user', JSON.stringify(profile));
    setSuccessMsg('Signed in successfully! Redirecting...');
    
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthSuccess(profile!, false);
    }, 850);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');

    if (resetStep === 1) {
      const cleanPhone = resetPhone.trim().replace(/\s+/g, '');
      if (!cleanPhone) {
        setErrors({ resetPhone: 'Phone number is required' });
        return;
      }
      if (!/^[0-9]{11}$/.test(cleanPhone)) {
        setErrors({ resetPhone: 'Phone number must be exactly 11 digits' });
        return;
      }

      try {
        // 1. Check in Firestore collection 'users'
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const q = query(collection(db, 'users'), where('phoneNumber', '==', cleanPhone));
        const snap = await getDocs(q);

        let found: any = null;
        if (!snap.empty) {
          snap.forEach((doc) => {
            found = doc.data();
          });
        } else {
          // 2. Check in localStorage fallback
          const localUsersStr = localStorage.getItem('campus_foods_users');
          if (localUsersStr) {
            const localUsers = JSON.parse(localUsersStr);
            found = localUsers.find((u: any) => u.phoneNumber === cleanPhone);
          }
        }

        if (!found) {
          setErrorMsg('No account found with that phone number.');
          return;
        }

        setFoundUserForReset(found);
        setSuccessMsg('Account recovered successfully!');
        setResetStep(2);
      } catch (err) {
        console.error('Password reset lookup error:', err);
        setErrorMsg('Error searching account. Please try again.');
      }
    } else {
      const newErrors: Record<string, string> = {};
      if (!newPassword || newPassword.length < 6) {
        newErrors.newPassword = 'New password should be at least 6 characters';
      }
      if (newPassword !== confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      try {
        const hashed = await bcrypt.hash(newPassword, 10);
        // 1. Update in Firestore
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const docRef = doc(db, 'users', foundUserForReset.email.toLowerCase().trim());
        await updateDoc(docRef, { password: hashed });

        // 2. Update in localStorage fallback database
        const localUsersStr = localStorage.getItem('campus_foods_users');
        if (localUsersStr) {
          const localUsers = JSON.parse(localUsersStr);
          const index = localUsers.findIndex((u: any) => u.email.toLowerCase().trim() === foundUserForReset.email.toLowerCase().trim());
          if (index !== -1) {
            localUsers[index].password = hashed;
            localStorage.setItem('campus_foods_users', JSON.stringify(localUsers));
          }
        }

        setSuccessMsg('Your security password has been updated successfully! Please wait...');
        
        setTimeout(() => {
          setIsForgotPassword(false);
          setResetStep(1);
          setResetPhone('');
          setFoundUserForReset(null);
          setNewPassword('');
          setConfirmNewPassword('');
          setActiveTab('signin');
          setSuccessMsg('Password reset success! Please log in below.');
        }, 1500);
      } catch (err) {
        console.error('Update password error:', err);
        setErrorMsg('Error saving new password in database.');
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMsg('');
    setSuccessMsg('');

    const newErrors: Record<string, string> = {};
    if (!signupFirstName.trim()) {
      newErrors.signupFirstName = "First name is required";
    }
    if (!signupLastName.trim()) {
      newErrors.signupLastName = "Last name is required";
    }
    if (!signupEmail.trim()) {
      newErrors.signupEmail = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      newErrors.signupEmail = "Enter a valid email address";
    }
    
    const cleanPhone = signupPhone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      newErrors.signupPhone = "Phone number is required";
    } else if (!/^[0-9]{11}$/.test(cleanPhone)) {
      newErrors.signupPhone = "Phone number must be exactly 11 digits";
    }
    
    if (!signupLocation) {
      newErrors.signupLocation = "Please select a delivery location";
    }
    
    if (!signupPassword) {
      newErrors.signupPassword = "Password is required";
    } else if (signupPassword.length < 6) {
      newErrors.signupPassword = "Password must be at least 6 characters";
    }
    
    if (signupConfirmPassword !== signupPassword) {
      newErrors.signupConfirmPassword = "Passwords do not match";
    }
    
    if (isStaffOpen && !adminCode.trim()) {
      newErrors.adminCode = "Staff invitation code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Registration Fields Required',
        message: Object.values(newErrors).join('\n')
      });
      return;
    }

    setIsSubmitting(true);
    const trimmedEmail = signupEmail.toLowerCase().trim();

    try {
      // Check if user already exists in Firestore
      let alreadyUser = await getUserProfileFromDb(trimmedEmail);

      if (!alreadyUser) {
        // Double check local storage register
        const localUsersStr = localStorage.getItem('campus_foods_users');
        if (localUsersStr) {
          const localUsers = JSON.parse(localUsersStr);
          alreadyUser = localUsers.find((u: any) => u.email.toLowerCase().trim() === trimmedEmail);
        }
      }

      if (alreadyUser) {
        setErrorMsg('An account already exists with this email address.');
        setShowFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Account Already Exists',
          message: 'An account already exists with this email address. Please sign in instead.'
        });
        setIsSubmitting(false);
        return;
      }

      const ADMIN_INVITE_CODE = (import.meta as any).env.VITE_ADMIN_INVITE_CODE || 'CFADMIN2025';

      // Check admin status invitation code
      if (isStaffOpen && adminCode !== ADMIN_INVITE_CODE) {
        setErrors({ adminCode: "Invalid Staff invitation code" });
        setShowFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'Invalid Staff Code',
          message: 'The Staff invitation code you provided is incorrect. Please contact kitchen managers to receive a valid invite pass.'
        });
        setIsSubmitting(false);
        return;
      }

      const hashedPassword = await bcrypt.hash(signupPassword, 10);

      const newUser = {
        email: trimmedEmail,
        password: hashedPassword,
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        fullName: `${signupFirstName.trim()} ${signupLastName.trim()}`,
        phoneNumber: cleanPhone,
        deliveryLocation: signupLocation,
        roomNumber: signupRoom.trim() || 'N/A',
        role: isStaffOpen && adminCode === ADMIN_INVITE_CODE ? 'admin' : 'student'
      };

      // Save user profile directly to database
      await saveUserProfileToDb(trimmedEmail, newUser);

      // Save user profile to local fallback list
      const localUsersStr = localStorage.getItem('campus_foods_users');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      localUsers.push(newUser);
      localStorage.setItem('campus_foods_users', JSON.stringify(localUsers));

      const profile: UserProfile = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        deliveryLocation: newUser.deliveryLocation,
        roomNumber: newUser.roomNumber,
        role: newUser.role as any
      };

      localStorage.setItem('campus_foods_current_user', JSON.stringify(profile));
      setSuccessMsg('Account registered cleanly! Signing in immediately...');
      
      setShowFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'Successfully logged in 🔑',
        message: `Welcome, ${profile.fullName}! Your campus foods profile has been created successfully. Let's make an order!`,
        onClose: () => {
          setIsSubmitting(false);
          onAuthSuccess(profile, true);
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg('Failed to create account. Please check your network connection.');
      setShowFeedbackModal({
        isOpen: true,
        type: 'error',
        title: 'Registration Error',
        message: 'Failed to create account. Please check your network connection and try again.'
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

        {/* Tab Switcher */}
        <div id="auth-tab-switcher" className="border-2 border-gray-200 rounded-2xl p-1.5 flex mt-8 bg-white shadow-sm">
          <button
            id="sign-in-tab"
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`flex-1 font-bold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
              activeTab === 'signin'
                ? 'bg-brand-orange text-white shadow-md shadow-orange-500/10'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LogIn size={16} />
            <span>Sign in</span>
          </button>
          
          <button
            id="sign-up-tab"
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`flex-1 font-bold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-brand-orange text-white shadow-md shadow-orange-500/10'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <UserPlus size={16} />
            <span>Register</span>
          </button>
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

        {/* Sliding Panel Outer Container */}
        <div className="relative overflow-hidden mt-6">
          
          {/* ==================== SIGN IN PANEL ==================== */}
          <div
            id="sign-in-form-card"
            style={{
              transform: activeTab === 'signin' ? 'translateX(0%)' : 'translateX(-110%)',
              opacity: activeTab === 'signin' ? 1 : 0,
              pointerEvents: activeTab === 'signin' ? 'auto' : 'none',
              position: activeTab === 'signin' ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            }}
          >
            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100">
              
              {!isForgotPassword ? (
                /* STANDALONE SIGN IN FORM */
                <form onSubmit={handleSignIn} className="space-y-5">
                  <h2 className="font-display font-bold text-2xl text-[#1a1a1a] mb-6">
                    Welcome Back! 👋
                  </h2>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                      EMAIL ADDRESS
                    </label>
                    <div 
                      className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                        errors.loginEmail 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                      }`}
                    >
                      <Mail size={16} className="text-gray-300 ml-4 shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder=""
                        value={loginEmail}
                        onChange={(e) => {
                          setLoginEmail(e.target.value);
                          if (errors.loginEmail) setErrors(prev => { const d = {...prev}; delete d.loginEmail; return d; });
                        }}
                        className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                      />
                    </div>
                    {errors.loginEmail && (
                      <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.loginEmail}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase block">
                        PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setErrors({});
                          setErrorMsg('');
                          setSuccessMsg('');
                          setResetStep(1);
                        }}
                        className="text-brand-orange text-xs font-bold cursor-pointer hover:underline outline-none"
                      >
                        Forgot Password? 🔑
                      </button>
                    </div>
                    
                    <div 
                      className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                        errors.loginPassword 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                      }`}
                    >
                      <Lock size={16} className="text-gray-300 ml-4 shrink-0" />
                      <input
                        type={showLoginPass ? 'text' : 'password'}
                        required
                        placeholder="Password matches..."
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (errors.loginPassword) setErrors(prev => { const d = {...prev}; delete d.loginPassword; return d; });
                        }}
                        className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass(!showLoginPass)}
                        className="text-gray-300 hover:text-gray-500 mr-4 cursor-pointer focus:outline-none"
                      >
                        {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.loginPassword && (
                      <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.loginPassword}
                      </p>
                    )}
                  </div>

                  {/* Button with warm radial glow */}
                  <div className="relative mt-6">
                    <div className="absolute inset-x-8 bottom-0 h-4 bg-orange-300/40 blur-xl rounded-full" />
                    <button
                      id="login-submit-button"
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-brand-orange hover:bg-[#e07f00] text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer ${
                        isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Signing In...</span>
                        </span>
                      ) : (
                        <span>Sign In Securely →</span>
                      )}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-gray-150"></div>
                    <span className="flex-shrink mx-4 text-gray-400 font-sans font-bold text-[10px] tracking-wider uppercase select-none">or continue with</span>
                    <div className="flex-grow border-t border-gray-150"></div>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-gray-50 text-[#1a1a1a] border-2 border-gray-200 font-bold py-4 rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path fill="#4285F4" d="M23.64 12.204c0-.78-.07-1.53-.2-2.25H12v4.26h6.32c-.27 1.44-1.04 2.66-2.22 3.48v2.91h3.58c2.09-1.92 3.28-4.77 3.28-8.4z" />
                      <path fill="#34A853" d="M12 24c2.97 0 5.47-0.98 7.29-2.65l-3.58-2.91c-.99.66-2.26 1.05-3.71 1.05-2.86 0-5.28-1.93-6.14-4.52H2.1v2.84C3.92 21.46 7.73 24 12 24z" />
                      <path fill="#FBBC05" d="M5.86 14.97A7.99 7.99 0 0 1 5.5 12c0-1 .24-1.95.66-2.83V6.33H2.1A12.02 12.02 0 0 0 0 12c0 1.94.5 3.77 1.4 5.37l4.46-2.4z" />
                      <path fill="#EA4335" d="M12 4.8c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.46 1.24 14.97 0 12 0 7.73 0 3.92 2.54 2.1 6.33l4.46 2.84C6.72 6.73 9.14 4.8 12 4.8z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>
              ) : (
                /* CONDITIONAL FORGOT PASSWORD FORM */
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                  <div 
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrors({});
                      setErrorMsg('');
                      setSuccessMsg('');
                      setResetStep(1);
                      setResetPhone('');
                      setFoundUserForReset(null);
                    }}
                    className="text-brand-orange text-sm font-bold cursor-pointer flex items-center gap-1 mb-6 hover:underline"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Sign In</span>
                  </div>

                  <h2 className="font-display font-bold text-2xl text-[#1a1a1a] mb-2">
                    Reset Password 🔐
                  </h2>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    Enter your registered phone number and we'll help you set a new password.
                  </p>

                  {resetStep === 1 ? (
                    <div className="space-y-4">
                      {/* Phone Input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                          PHONE NUMBER
                        </label>
                        <div 
                          className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                            errors.resetPhone 
                              ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                              : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                          }`}
                        >
                          <Phone size={16} className="text-gray-300 ml-4 shrink-0" />
                          <input
                            type="tel"
                            required
                            placeholder="08113860805"
                            value={resetPhone}
                            onChange={(e) => {
                              setResetPhone(e.target.value);
                              if (errors.resetPhone) setErrors(prev => { const d = {...prev}; delete d.resetPhone; return d; });
                            }}
                            className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                          />
                        </div>
                        {errors.resetPhone && (
                          <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle size={11} /> {errors.resetPhone}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-4">
                        <div className="absolute inset-x-8 bottom-0 h-4 bg-orange-300/40 blur-xl rounded-full" />
                        <button
                          type="submit"
                          className="w-full bg-brand-orange hover:bg-[#e07f00] text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                        >
                          Validate Phone Details 🔒
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Found identity confirmation banner */}
                      {foundUserForReset && (
                        <div className="bg-[#fff9f2] border border-orange-100 p-4 rounded-2xl space-y-1 text-xs">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase">Linked Student Info</span>
                          <p className="font-extrabold text-[#1a1a1a]">👤 {foundUserForReset.fullName}</p>
                          <p className="text-[11px] font-mono text-gray-500">📩 {foundUserForReset.email}</p>
                        </div>
                      )}

                      {/* New Password */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                          NEW PASSWORD
                        </label>
                        <div 
                          className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                            errors.newPassword 
                              ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                              : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                          }`}
                        >
                          <Lock size={16} className="text-gray-300 ml-4 shrink-0" />
                          <input
                            type={showResetPass ? 'text' : 'password'}
                            required
                            placeholder="At least 6 characters..."
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (errors.newPassword) setErrors(prev => { const d = {...prev}; delete d.newPassword; return d; });
                            }}
                            className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowResetPass(!showResetPass)}
                            className="text-gray-300 hover:text-gray-500 mr-4 cursor-pointer focus:outline-none"
                          >
                            {showResetPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle size={11} /> {errors.newPassword}
                          </p>
                        )}
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                          CONFIRM PASSWORD
                        </label>
                        <div 
                          className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                            errors.confirmNewPassword 
                              ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                              : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                          }`}
                        >
                          <Lock size={16} className="text-gray-300 ml-4 shrink-0" />
                          <input
                            type={showConfirmResetPass ? 'text' : 'password'}
                            required
                            placeholder="Confirm your brand new password"
                            value={confirmNewPassword}
                            onChange={(e) => {
                              setConfirmNewPassword(e.target.value);
                              if (errors.confirmNewPassword) setErrors(prev => { const d = {...prev}; delete d.confirmNewPassword; return d; });
                            }}
                            className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmResetPass(!showConfirmResetPass)}
                            className="text-gray-300 hover:text-gray-500 mr-4 cursor-pointer focus:outline-none"
                          >
                            {showConfirmResetPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {errors.confirmNewPassword && (
                          <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle size={11} /> {errors.confirmNewPassword}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-6">
                        <div className="absolute inset-x-8 bottom-0 h-4 bg-orange-300/40 blur-xl rounded-full" />
                        <button
                          type="submit"
                          className="w-full bg-brand-orange hover:bg-[#e07f00] text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                        >
                          Reset My Password
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

            </div>
          </div>

          {/* ==================== SIGN UP PANEL ==================== */}
          <div
            id="sign-up-form-card"
            style={{
              transform: activeTab === 'signup' ? 'translateX(0%)' : 'translateX(110%)',
              opacity: activeTab === 'signup' ? 1 : 0,
              pointerEvents: activeTab === 'signup' ? 'auto' : 'none',
              position: activeTab === 'signup' ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            }}
          >
            <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100">
              <form onSubmit={handleSignUp} className="space-y-4">
                <h2 className="font-display font-bold text-2xl text-[#1a1a1a] mb-6">
                  Create Account 🎉
                </h2>

                {/* First and Last Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                      FIRST NAME
                    </label>
                    <div 
                      className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                        errors.signupFirstName 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                      }`}
                    >
                      <User size={16} className="text-gray-300 ml-4 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={signupFirstName}
                        onChange={(e) => {
                          setSignupFirstName(e.target.value);
                          if (errors.signupFirstName) setErrors(prev => { const d = {...prev}; delete d.signupFirstName; return d; });
                        }}
                        className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                      />
                    </div>
                    {errors.signupFirstName && (
                      <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.signupFirstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                      LAST NAME
                    </label>
                    <div 
                      className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                        errors.signupLastName 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                      }`}
                    >
                      <User size={16} className="text-gray-300 ml-4 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={signupLastName}
                        onChange={(e) => {
                          setSignupLastName(e.target.value);
                          if (errors.signupLastName) setErrors(prev => { const d = {...prev}; delete d.signupLastName; return d; });
                        }}
                        className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                      />
                    </div>
                    {errors.signupLastName && (
                      <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.signupLastName}
                      </p>
                    )}
                  </div>

                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                    EMAIL ADDRESS
                  </label>
                  <div 
                    className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                      errors.signupEmail 
                        ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                        : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                    }`}
                  >
                    <Mail size={16} className="text-gray-300 ml-4 shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder=""
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value);
                        if (errors.signupEmail) setErrors(prev => { const d = {...prev}; delete d.signupEmail; return d; });
                      }}
                      className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                    />
                  </div>
                  {errors.signupEmail && (
                    <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.signupEmail}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                    PHONE NUMBER
                  </label>
                  <div 
                    className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                      errors.signupPhone 
                        ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                        : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                    }`}
                  >
                    <Phone size={16} className="text-gray-300 ml-4 shrink-0" />
                    <input
                      type="tel"
                      required
                      placeholder="08113860805"
                      value={signupPhone}
                      onChange={(e) => {
                        setSignupPhone(e.target.value);
                        if (errors.signupPhone) setErrors(prev => { const d = {...prev}; delete d.signupPhone; return d; });
                      }}
                      className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                    />
                  </div>
                  {errors.signupPhone && (
                    <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.signupPhone}
                    </p>
                  )}
                </div>

                {/* Delivery Location Select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                    DELIVERY LOCATION
                  </label>
                  <div 
                    className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                      errors.signupLocation 
                        ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                        : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                    }`}
                  >
                    <MapPin size={16} className="text-gray-300 ml-4 shrink-0 pointer-events-none" />
                    <select
                      required
                      value={signupLocation}
                      onChange={(e) => {
                        setSignupLocation(e.target.value);
                        if (errors.signupLocation) setErrors(prev => { const d = {...prev}; delete d.signupLocation; return d; });
                      }}
                      className="flex-1 min-w-0 w-full py-3.5 pl-3 pr-10 text-sm text-gray-600 bg-transparent outline-none appearance-none cursor-pointer placeholder:text-gray-300"
                    >
                      <option value="" disabled className="text-gray-300">Select delivery lounge/hostel</option>
                      {nigeriaHostels.map((loc) => (
                        <option key={loc} value={loc} className="text-gray-700">{loc}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="text-gray-400 absolute right-4 pointer-events-none" />
                  </div>
                  {errors.signupLocation && (
                    <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.signupLocation}
                    </p>
                  )}
                </div>

                {/* Room Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                    ROOM NUMBER (Optional)
                  </label>
                  <div className="relative flex items-center border border-orange-200 rounded-2xl bg-white focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Hash size={16} className="text-gray-300 ml-4 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Room 14B"
                      value={signupRoom}
                      onChange={(e) => setSignupRoom(e.target.value)}
                      className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                      PASSWORD
                    </label>
                    <div 
                      className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                        errors.signupPassword 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                      }`}
                    >
                      <Lock size={16} className="text-gray-300 ml-4 shrink-0" />
                      <input
                        type={showSignupPass ? 'text' : 'password'}
                        required
                        placeholder="Password matches..."
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value);
                          if (errors.signupPassword) setErrors(prev => { const d = {...prev}; delete d.signupPassword; return d; });
                        }}
                        className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPass(!showSignupPass)}
                        className="text-gray-300 hover:text-gray-500 mr-4 cursor-pointer focus:outline-none"
                      >
                        {showSignupPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.signupPassword && (
                      <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.signupPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                      CONFIRM PASSWORD
                    </label>
                    <div 
                      className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                        errors.signupConfirmPassword 
                          ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                          : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                      }`}
                    >
                      <Lock size={16} className="text-gray-300 ml-4 shrink-0" />
                      <input
                        type={showSignupConfirmPass ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
                        value={signupConfirmPassword}
                        onChange={(e) => {
                          setSignupConfirmPassword(e.target.value);
                          if (errors.signupConfirmPassword) setErrors(prev => { const d = {...prev}; delete d.signupConfirmPassword; return d; });
                        }}
                        className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirmPass(!showSignupConfirmPass)}
                        className="text-gray-300 hover:text-gray-500 mr-4 cursor-pointer focus:outline-none"
                      >
                        {showSignupConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.signupConfirmPassword && (
                      <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {errors.signupConfirmPassword}
                      </p>
                    )}
                  </div>

                </div>

                {/* Staff Toggle Open (Animate height toggle) */}
                <div className="flex flex-col items-center border-t border-gray-100 pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsStaffOpen(!isStaffOpen)}
                    className="text-xs text-gray-400 text-center cursor-pointer hover:text-brand-orange font-semibold transition-colors outline-none"
                  >
                    {isStaffOpen ? "Are you a student? Standard registration here ←" : "Are you a staff member? Register here →"}
                  </button>
                  
                  <div 
                    style={{
                      maxHeight: isStaffOpen ? '120px' : '0px',
                      opacity: isStaffOpen ? 1 : 0,
                      transition: 'all 0.3s ease-in-out',
                    }}
                    className="w-full overflow-hidden mt-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-2 block">
                        STAFF INVITATION CODE
                      </label>
                      <div 
                        className={`relative flex items-center border rounded-2xl bg-white transition-all ${
                          errors.adminCode 
                            ? 'border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100' 
                            : 'border-orange-200 focus-within:border-brand-orange focus-within:ring-2 focus-within:ring-orange-100'
                        }`}
                      >
                        <Shield size={16} className="text-gray-300 ml-4 shrink-0" />
                        <input
                          type={showAdminCode ? 'text' : 'password'}
                          placeholder="Enter your invitation code"
                          value={adminCode}
                          onChange={(e) => {
                            setAdminCode(e.target.value);
                            if (errors.adminCode) setErrors(prev => { const d = {...prev}; delete d.adminCode; return d; });
                          }}
                          className="flex-1 min-w-0 w-full py-3.5 px-3 text-sm text-gray-600 bg-transparent outline-none placeholder:text-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminCode(!showAdminCode)}
                          className="text-gray-300 hover:text-gray-500 mr-4 cursor-pointer focus:outline-none"
                        >
                          {showAdminCode ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.adminCode && (
                        <p className="text-red-400 text-[11px] mt-1 ml-1 flex items-center gap-1">
                          <AlertCircle size={11} /> {errors.adminCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Glow button wrapper */}
                <div className="relative mt-6">
                  <div className="absolute inset-x-8 bottom-0 h-4 bg-orange-300/40 blur-xl rounded-full" />
                  <button
                    id="register-submit-button"
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-brand-orange hover:bg-[#e07f00] text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200/60 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer ${
                      isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </span>
                    ) : (
                      <span>Create My Account 🚀</span>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-gray-150"></div>
                  <span className="flex-shrink mx-4 text-gray-400 font-sans font-bold text-[10px] tracking-wider uppercase select-none">or register with</span>
                  <div className="flex-grow border-t border-gray-150"></div>
                </div>

                {/* Google Register Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-gray-50 text-[#1a1a1a] border-2 border-gray-200 font-bold py-4 rounded-2xl text-xs flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] transition-all duration-200 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path fill="#4285F4" d="M23.64 12.204c0-.78-.07-1.53-.2-2.25H12v4.26h6.32c-.27 1.44-1.04 2.66-2.22 3.48v2.91h3.58c2.09-1.92 3.28-4.77 3.28-8.4z" />
                    <path fill="#34A853" d="M12 24c2.97 0 5.47-0.98 7.29-2.65l-3.58-2.91c-.99.66-2.26 1.05-3.71 1.05-2.86 0-5.28-1.93-6.14-4.52H2.1v2.84C3.92 21.46 7.73 24 12 24z" />
                    <path fill="#FBBC05" d="M5.86 14.97A7.99 7.99 0 0 1 5.5 12c0-1 .24-1.95.66-2.83V6.33H2.1A12.02 12.02 0 0 0 0 12c0 1.94.5 3.77 1.4 5.37l4.46-2.4z" />
                    <path fill="#EA4335" d="M12 4.8c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.46 1.24 14.97 0 12 0 7.73 0 3.92 2.54 2.1 6.33l4.46 2.84C6.72 6.73 9.14 4.8 12 4.8z" />
                  </svg>
                  <span>Register with Google</span>
                </button>

              </form>
            </div>
          </div>

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
