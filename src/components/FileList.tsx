import React, { useState } from 'react';
import { FileItem, CompressionSettings } from '../types';
import { formatBytes } from '../lib/utils';
import { FileText, X, Sparkles, Loader2, CheckCircle2, AlertCircle, Trash2, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PdfThumbnail } from './PdfThumbnail';

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onAnalyze: (id: string) => void;
  onClearAll?: () => void;
  onRename?: (id: string, newName: string) => void;
  settings: CompressionSettings;
}

export function FileList({ files, onRemove, onAnalyze, onClearAll, onRename, settings }: FileListProps) {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    await onAnalyze(id);
    setAnalyzingId(null);
  };

  const handleClearConfirm = () => {
    if (onClearAll) {
      onClearAll();
    }
    setShowClearConfirm(false);
  };

  const startRename = (id: string, currentName: string) => {
    if (!onRename) return;
    setEditingId(id);
    setEditName(currentName.replace(/\.pdf$/i, ''));
  };

  const commitRename = (id: string) => {
    if (onRename && editName.trim()) {
      onRename(id, editName);
    }
    setEditingId(null);
  };

  return (
    <div className="w-full bg-[#0F1219]/40 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.03)_0%,_transparent_70%)] pointer-events-none"></div>
      
      <div className="px-4 py-4 border-b border-slate-800/60 bg-slate-900/20 flex justify-between items-center z-10">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          Queue: {files.length} Files
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-xs text-indigo-400 font-semibold">
            Total Size: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
          </span>
          {files.length > 0 && onClearAll && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 z-10 relative">
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 right-4 bg-slate-900 border border-red-500/50 rounded-xl p-4 shadow-xl z-20 flex flex-col items-center text-center space-y-3"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-sm text-slate-300">Are you sure you want to remove all {files.length} files from the queue?</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleClearConfirm}
                  className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="group bg-slate-800/30 hover:bg-slate-800/50 border border-slate-800 p-4 rounded-xl flex flex-col transition-all"
            >
              {(() => {
                const reductionRatio = settings.imageQuality ? (settings.imageQuality / 100) * 0.8 : 0.6;
                const simulatedSize = Math.floor(file.size * reductionRatio);
                const reductionPercent = Math.round((1 - reductionRatio) * 100);

                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 truncate mr-4">
                      <PdfThumbnail file={file.file} />
                      <div className="truncate flex-1">
                        {editingId === file.id ? (
                          <div className="flex items-center">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onBlur={() => commitRename(file.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename(file.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-sm text-slate-200 outline-none w-full max-w-[200px]"
                            />
                            <span className="text-sm text-slate-500 ml-1">.pdf</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/title">
                            <h3 className="text-sm font-semibold text-slate-200 truncate" title={file.name}>
                              {file.name}
                            </h3>
                            {onRename && (
                              <button
                                onClick={() => startRename(file.id, file.name)}
                                className="text-slate-500 hover:text-indigo-400 transition-all p-1"
                                title="Rename file"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 line-through">
                            {formatBytes(file.size)}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-xs font-bold text-emerald-400">
                            Est: {formatBytes(simulatedSize)}
                          </span>
                          {file.analysis && (
                            <>
                              <span className="text-[10px] text-slate-600">•</span>
                              <span className="text-xs text-indigo-400 font-medium">
                                Smart Analyzed
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        -{reductionPercent}% Est.
                      </div>
                      {!file.analysis && (
                        <button
                          onClick={() => handleAnalyze(file.id)}
                          disabled={analyzingId !== null}
                          className="group/btn flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {analyzingId === file.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          Analyze
                        </button>
                      )}
                      
                      <button
                        onClick={() => onRemove(file.id)}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* AI Analysis Result Expansion */}
              {file.analysis && (
                <motion.div 
                  initial={{ opacity: 0, marginTop: 0 }}
                  animate={{ opacity: 1, marginTop: 12 }}
                  className="pl-14"
                >
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Type</span>
                        <span className="font-medium text-slate-300">{file.analysis.docType}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Recommendation</span>
                        <span className="text-slate-400 text-xs">
                          {file.analysis.recommendedSettings.imageQuality}% Q • {file.analysis.recommendedSettings.dpi} DPI • {file.analysis.recommendedSettings.colorMode}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {files.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No files selected
          </div>
        )}
      </div>
    </div>
  );
}
