import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DropzoneProps {
  onFilesDropped: (files: File[]) => void;
  className?: string;
}

export function Dropzone({ onFilesDropped, className }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      if (droppedFiles.length > 0) {
        onFilesDropped(droppedFiles);
      }
    },
    [onFilesDropped]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files).filter(
          (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );
        onFilesDropped(selectedFiles);
      }
      // Reset input so the same files can be selected again if needed
      e.target.value = '';
    },
    [onFilesDropped]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto border border-dashed rounded-2xl p-16 transition-all duration-300 ease-in-out group cursor-pointer bg-slate-900/40",
        isDragging 
          ? "border-indigo-500/80 bg-indigo-500/10" 
          : "border-indigo-500/30 hover:border-indigo-500/60 hover:bg-slate-800/40",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload PDFs"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-6 pointer-events-none">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
          isDragging ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300"
        )}>
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-slate-200">
            Drop PDFs here
          </h3>
          <p className="text-slate-500 text-sm">
            or click to browse files
          </p>
        </div>
        
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            Unlimited files
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1">
            Batch processing enabled
          </span>
        </div>
      </div>
    </motion.div>
  );
}
