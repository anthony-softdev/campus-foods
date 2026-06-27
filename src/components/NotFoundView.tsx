import React from 'react';
import { ViewType } from '../types';

interface NotFoundViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function NotFoundView({ onNavigate }: NotFoundViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 pt-20 pb-16">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md text-center space-y-4 animate-fadeIn">
        <div className="text-5xl">🤔</div>
        <h1 className="font-display font-extrabold text-3xl text-[#1a1a1a]">404 - Page Not Found</h1>
        <p className="text-gray-500 text-sm font-sans">Oops! The page you are looking for does not exist. It might have been moved or deleted.</p>
        <button onClick={() => onNavigate('home')} className="bg-brand-orange text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#e07f00] transition-colors cursor-pointer">
          Go to Homepage
        </button>
      </div>
    </div>
  );
}