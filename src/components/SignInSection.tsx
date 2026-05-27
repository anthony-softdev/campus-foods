import React from 'react';

interface SignInSectionProps {
  signinEmail: string;
  setSigninEmail: (val: string) => void;
  signinPassword: string;
  setSigninPassword: (val: string) => void;
  handleSignInSubmit: (e: React.FormEvent) => void;
  navigateTo: (target: any) => void;
}

export default function SignInSection({
  signinEmail,
  setSigninEmail,
  signinPassword,
  setSigninPassword,
  handleSignInSubmit,
  navigateTo
}: SignInSectionProps) {
  return (
    <div className="py-16 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5 animate-fade-in">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 font-semibold text-xs sm:text-sm">Sign in to your Campus Foods account to dispatch hot meals.</p>
        </div>

        <form onSubmit={handleSignInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="student@campus.edu"
              value={signinEmail}
              onChange={(e) => setSigninEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-amber-500 transition font-sans" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={signinPassword}
              onChange={(e) => setSigninPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-amber-500 transition font-sans" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl transition text-sm shadow-md shadow-amber-500/10 cursor-pointer border-0"
          >
            Verify and Log In
          </button>
        </form>

        <div className="text-center text-xs sm:text-sm font-semibold text-slate-500">
          New to Campus Foods?{' '}
          <button 
            type="button"
            onClick={() => navigateTo('signup')} 
            className="text-amber-600 hover:underline cursor-pointer font-bold bg-transparent border-0"
          >
            Create Account Here
          </button>
        </div>

      </div>
    </div>
  );
}
