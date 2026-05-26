import React from 'react';

interface SignUpSectionProps {
  signupFname: string;
  setSignupFname: (val: string) => void;
  signupLname: string;
  setSignupLname: (val: string) => void;
  signupGender: string;
  setSignupGender: (val: string) => void;
  signupEmail: string;
  setSignupEmail: (val: string) => void;
  signupPhone: string;
  setSignupPhone: (val: string) => void;
  signupPassword: string;
  setSignupPassword: (val: string) => void;
  handleSignUpSubmit: (e: React.FormEvent) => void;
  navigateTo: (target: any) => void;
}

export default function SignUpSection({
  signupFname,
  setSignupFname,
  signupLname,
  setSignupLname,
  signupGender,
  setSignupGender,
  signupEmail,
  setSignupEmail,
  signupPhone,
  setSignupPhone,
  signupPassword,
  setSignupPassword,
  handleSignUpSubmit,
  navigateTo
}: SignUpSectionProps) {
  return (
    <div className="py-16 flex items-center justify-center px-4 animate-fade-in">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5 animate-fade-in">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Create Account</h2>
          <p className="text-slate-500 font-semibold text-xs sm:text-sm">Register to enjoy lightning-fast customizable campus delivery.</p>
        </div>

        <form onSubmit={handleSignUpSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
              <input 
                type="text" 
                required 
                placeholder="Jane"
                value={signupFname}
                onChange={(e) => setSignupFname(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
              <input 
                type="text" 
                required 
                placeholder="Doe"
                value={signupLname}
                onChange={(e) => setSignupLname(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender Selection</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setSignupGender('Male')}
                className={`py-2 px-3 rounded-xl border border-solid text-xs sm:text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition ${signupGender === 'Male' ? 'bg-amber-50 border-amber-500 text-amber-850' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'}`}
              >
                Male
              </button>
              <button 
                type="button"
                onClick={() => setSignupGender('Female')}
                className={`py-2 px-3 rounded-xl border border-solid text-xs sm:text-sm font-bold flex items-center justify-center gap-1 cursor-pointer transition ${signupGender === 'Female' ? 'bg-amber-50 border-amber-500 text-amber-850' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'}`}
              >
                Female
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Campus Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="student@campus.edu"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Active Phone Number</label>
            <input 
              type="tel" 
              required 
              placeholder="e.g. 08031234567"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Choose Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-sans" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl transition text-sm shadow-md shadow-amber-500/10 cursor-pointer border-0"
          >
            Create and Activate Account
          </button>
        </form>

        <div className="text-center text-xs sm:text-sm font-semibold text-slate-500">
          Already registered?{' '}
          <button 
            type="button"
            onClick={() => navigateTo('signin')} 
            className="text-amber-600 hover:underline cursor-pointer font-bold bg-transparent border-0"
          >
            Sign In Help &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
