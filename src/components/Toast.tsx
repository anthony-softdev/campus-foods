import React from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  isVisible: boolean;
  message: string;
}

export default function Toast({ isVisible, message }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-55 max-w-sm"
          id="toast-notification-panel"
        >
          <div className="bg-amber-500 text-white p-1.5 rounded-xl shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">System Alert</p>
            <p className="text-xs font-semibold text-slate-100">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
