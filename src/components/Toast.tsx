import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

export type ToastType = 'error' | 'success';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[200] max-w-sm w-full p-4 rounded-2xl shadow-2xl flex items-start gap-3 border ${
        type === 'error' 
          ? 'bg-red-500/10 border-red-500/30 backdrop-blur-md' 
          : 'bg-emerald-500/10 border-emerald-500/30 backdrop-blur-md'
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
        {type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
      </div>
      <div className="flex-1 text-sm font-medium text-slate-200 pr-2">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 p-1 rounded-lg hover:bg-slate-800/50 text-slate-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
