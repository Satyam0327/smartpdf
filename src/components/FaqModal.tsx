import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle } from 'lucide-react';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FaqModal({ isOpen, onClose }: FaqModalProps) {
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
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300">
              <section>
                <h3 className="text-lg font-semibold text-white mb-2">How is this 100% offline if it's a website?</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Modern web browsers are incredibly powerful. When you use SmartPDF Compressor, the app downloads a compression engine (JavaScript) to your browser. When you drop a PDF, the processing happens entirely in your local device's memory (RAM). Your files are never sent over the internet to our servers.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">Can I process 100+ PDFs at once?</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Yes. The application is architected to process files sequentially (one by one). This prevents your browser from running out of memory (crashing) when handling massive batches of large PDFs. Just drop them in and let it run!
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">What happens if a file is corrupted or encrypted?</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  The compressor has built-in edge-case handling. If a file is password-protected or physically corrupted, the app will safely catch the error, mark that specific file as "Failed", and seamlessly continue processing the rest of your batch.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">What data does the Smart Analyzer see?</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Absolutely nothing leaves your device! If you use the Smart Analysis feature, an intelligent algorithm built directly into the webpage calculates the density of your file (bytes per page) to automatically apply the optimal compression settings. It is 100% offline and secure.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-2">Which browsers are supported?</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  The app uses standard HTML5 Canvas rendering. It works flawlessly on Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. For the absolute best performance on large batches, we recommend Google Chrome or Microsoft Edge.
                </p>
              </section>
            </div>
            
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
