import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0E14]/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 text-slate-300">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-300 text-sm leading-relaxed">
                <strong>TL;DR:</strong> Your PDFs never leave your device. We cannot see, read, or store the contents of your files. We only track how many times you click "Compress" to manage our free-tier limits.
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">1. File Processing & Security</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  SmartPDF Compressor operates entirely via Client-Side Processing. When you select or drop a file into the application, the file is loaded directly into your browser's local memory. The rasterization, downsampling, and PDF rebuilding happen using your device's CPU and RAM. <strong>We do not have backend storage servers for PDFs.</strong> Therefore, it is mathematically impossible for us to leak, sell, or view your documents.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">2. Data Collection (Authentication)</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  If you choose to Sign In using Google, we collect and store:
                </p>
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 ml-2">
                  <li>Your email address and basic profile info provided by Google.</li>
                  <li>A numerical count of how many PDFs you compress per day.</li>
                </ul>
                <p className="text-sm leading-relaxed text-slate-400 mt-2">
                  This data is securely stored using Google Firebase Authentication and Firestore to enforce daily usage limits. It is never sold to third parties.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">3. Artificial Intelligence Usage</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  When you use the AI Settings Recommendation feature, the app sends a highly restricted metadata payload to our servers (e.g., <code>size: 1.2MB, pages: 10</code>). The actual content, text, and images of your PDF are <strong>never</strong> transmitted to the AI or our servers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">4. Cookies and Local Storage</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  We use browser Local Storage to remember your compression settings and track anonymous daily usage limits if you are not signed in. 
                </p>
              </section>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
