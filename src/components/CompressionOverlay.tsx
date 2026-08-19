import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileDown, Sparkles, Zap } from 'lucide-react';

const PHRASES = [
  "Squeezing the pixels...",
  "Making it smol 🥺",
  "Cooking... 👨‍🍳",
  "Packing it tight! 📦",
  "Almost done bestie ✨",
  "Crunching the numbers...",
  "Deflating the PDF 🎈",
  "Applying the magic ✨"
];

interface CompressionOverlayProps {
  isProcessing: boolean;
}

export function CompressionOverlay({ isProcessing }: CompressionOverlayProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setPhraseIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0E14]/80 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center justify-center space-y-8 relative">
            
            {/* Pulsing background blobs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["30%", "40%", "50%", "40%", "30%"]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-48 h-48 bg-indigo-500/30 blur-3xl -z-10"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                rotate: [360, 270, 180, 90, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-40 h-40 bg-pink-500/20 blur-3xl -z-10"
            />

            {/* The Bouncing/Squishing Icon container */}
            <motion.div
              animate={{
                y: [0, -25, 0],
                scaleX: [1, 0.85, 1.15, 1],
                scaleY: [1, 1.15, 0.85, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative bg-gradient-to-br from-indigo-500 to-cyan-400 p-6 rounded-3xl shadow-[0_0_40px_rgba(99,102,241,0.5)] border border-white/20 flex items-center justify-center"
            >
              <FileDown className="w-12 h-12 text-white" />
              
              {/* Little orbiting sparks */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-full h-full"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-2 -right-2" />
                <Zap className="w-4 h-4 text-cyan-200 absolute -bottom-2 -left-2" />
              </motion.div>
            </motion.div>

            {/* Changing Text */}
            <div className="h-12 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={phraseIndex}
                  initial={{ y: 20, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200"
                >
                  {PHRASES[phraseIndex]}
                </motion.h3>
              </AnimatePresence>
            </div>
            
            {/* Fake progress bar that just loops endlessly for vibe */}
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{
                  x: ["-100%", "100%"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full"
              />
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
