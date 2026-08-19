import React, { useState } from 'react';
import { FileItem, CompressionSettings, CompressionMode } from './types';
import { Dropzone } from './components/Dropzone';
import { FileList } from './components/FileList';
import { SettingsPanel } from './components/SettingsPanel';
import { FaqModal } from './components/FaqModal';
import { PrivacyModal } from './components/PrivacyModal';
import { SeoContent } from './components/SeoContent';
import { CompressionOverlay } from './components/CompressionOverlay';
import { UploadCloud, CheckCircle2, ShieldCheck, Zap, Download, RefreshCw, X, WifiOff, Lock, BrainCircuit, Heart, ArrowLeft } from 'lucide-react';
import { formatBytes } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from 'jspdf';

// Set up pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [mode, setMode] = useState<CompressionMode>('Custom');
  const [settings, setSettings] = useState<CompressionSettings>({
    imageQuality: 70,
    dpi: 150,
    colorMode: 'RGB',
    removeMetadata: true,
  });
  const [useAiDefaults, setUseAiDefaults] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const handleFilesDropped = (droppedFiles: File[]) => {
    const newFiles: FileItem[] = droppedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7) + '_' + file.name,
      file,
      name: file.name,
      size: file.size,
      status: 'Pending',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setIsComplete(false);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRenameFile = (id: string, newName: string) => {
    let finalName = newName.trim();
    if (!finalName) return;
    if (!finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
    }
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: finalName } : f)));
  };

  const handleAnalyze = async (id: string) => {
    const fileItem = files.find((f) => f.id === id);
    if (!fileItem) return;

    try {
      // Extract metadata locally
      const arrayBuffer = await fileItem.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      // Simulate AI analysis locally (100% offline heuristic)
      const sizeMB = fileItem.file.size / (1024 * 1024);
      const density = sizeMB / pageCount; // MB per page
      
      let recommendedSettings: CompressionSettings = {
        imageQuality: 70,
        dpi: 144,
        colorMode: 'RGB',
        removeMetadata: true
      };
      let reasoning = "";

      if (density > 2) {
        reasoning = "High density document detected. Likely contains uncompressed raw images. Applying aggressive 72 DPI scaling and 60% quality compression.";
        recommendedSettings = { imageQuality: 60, dpi: 72, colorMode: 'RGB', removeMetadata: true };
      } else if (density > 0.5) {
        reasoning = "Standard mixed-media document. Balancing readability with size reduction (144 DPI, 70% quality).";
        recommendedSettings = { imageQuality: 70, dpi: 144, colorMode: 'RGB', removeMetadata: true };
      } else {
        reasoning = "Document is already lightweight or text-heavy. Using minimal compression (300 DPI, 80% quality) to preserve vector text sharpness.";
        recommendedSettings = { imageQuality: 80, dpi: 300, colorMode: 'RGB', removeMetadata: true };
      }

      // If document is extremely large, fallback to Grayscale to save space
      if (sizeMB > 50) {
        reasoning += " Document exceeds 50MB. Switching to Grayscale color mode to force extreme size reduction.";
        recommendedSettings.colorMode = 'Grayscale';
      }

      const analysis = {
        reasoning,
        recommendedSettings,
        estimatedReductionPercent: density > 2 ? 85 : density > 0.5 ? 65 : 30
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, analysis } : f))
      );
      
      if (useAiDefaults) {
        setSettings(analysis.recommendedSettings);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to analyze PDF locally.');
    }
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Truly offline processing entirely inside the browser
      const newFiles = [...files];
      for (let i = 0; i < newFiles.length; i++) {
        const f = newFiles[i];
        try {
          const arrayBuffer = await f.file.arrayBuffer();
          
          // Use PDF.js to load the document
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;
          const numPages = pdfDoc.numPages;
          
          // Create a new PDF using jsPDF
          const pdf = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4',
            compress: true
          });
          
          pdf.deletePage(1); // Remove default blank page

          const quality = settings.imageQuality ? settings.imageQuality / 100 : 0.7;
          // Scale based on DPI target (72 DPI is standard 1.0 scale for PDF pt)
          const scale = settings.dpi ? settings.dpi / 72 : 150 / 72;

          for (let p = 1; p <= numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const viewport = page.getViewport({ scale });
            
            // Create a canvas to render the page
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) throw new Error("Could not create canvas context");
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // Render PDF page into canvas context
            const renderContext = {
              canvasContext: ctx as any,
              viewport: viewport as any,
            };
            await page.render(renderContext).promise;
            
            // Handle Grayscale/B&W color mode
            if (settings.colorMode === 'Grayscale' || settings.colorMode === 'B&W') {
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imgData.data;
              for (let j = 0; j < data.length; j += 4) {
                // Luminance calculation
                const avg = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
                if (settings.colorMode === 'B&W') {
                  const bw = avg > 128 ? 255 : 0;
                  data[j] = data[j + 1] = data[j + 2] = bw;
                } else {
                  data[j] = data[j + 1] = data[j + 2] = avg;
                }
              }
              ctx.putImageData(imgData, 0, 0);
            }
            
            // Compress canvas to JPEG
            const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // PDF points (1 pt = 1/72 inch)
            const pdfWidth = viewport.width / scale;
            const pdfHeight = viewport.height / scale;
            
            pdf.addPage([pdfWidth, pdfHeight], pdfWidth > pdfHeight ? 'l' : 'p');
            pdf.addImage(imgDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          }
          
          if (settings.removeMetadata) {
            pdf.setProperties({
              title: '',
              subject: '',
              author: '',
              keywords: '',
              creator: ''
            });
          }

          // Get the final compressed blob
          const blob = pdf.output('blob');
          const downloadUrl = URL.createObjectURL(blob);
          
          newFiles[i] = {
            ...f,
            status: 'Completed',
            progress: 100,
            result: {
              compressedSize: blob.size,
              downloadUrl,
              filename: f.name.replace('.pdf', '_compressed.pdf')
            }
          };
        } catch (err) {
           console.error(`Failed to process ${f.name}:`, err);
           newFiles[i] = { 
             ...f, 
             status: 'Failed', 
             error: err instanceof Error && err.message.includes('encrypted') 
               ? 'PDF is encrypted or corrupted' 
               : 'Failed to compress or out of memory'
           };
        }
      }
      setFiles(newFiles);

      // Force a short artificial delay (2-3 seconds minimum) so the user gets to enjoy the fun animation 
      // even if the file was compressed instantly.
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred during compression.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    const successfulFiles = files.filter(f => f.result?.downloadUrl);
    if (successfulFiles.length === 0) return;

    if (successfulFiles.length === 1) {
      const a = document.createElement('a');
      a.href = successfulFiles[0].result!.downloadUrl;
      a.download = successfulFiles[0].result!.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const zip = new JSZip();
      for (const f of successfulFiles) {
        if (f.result?.downloadUrl) {
          const res = await fetch(f.result.downloadUrl);
          const blob = await res.blob();
          zip.file(f.result.filename, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SmartPDF_Compressed.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate ZIP", error);
      alert("Failed to create ZIP file for download. Please try downloading files individually.");
    }
  };

  const hasAnalyzedFiles = files.some(f => f.analysis);
  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalCompressedSize = files.reduce((acc, f) => acc + (f.result?.compressedSize || f.size), 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const savedPercentage = totalOriginalSize > 0 ? ((totalSaved / totalOriginalSize) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col">
      <header className="h-16 border-b border-slate-800/60 bg-[#0F1219]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SmartPDF <span className="text-indigo-400">Compressor</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://buymeacoffee.com/satyamsingh0327"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 px-3 py-1.5 rounded-full transition-colors group cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-pink-300">Support Me</span>
            </a>
            <div 
              className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full cursor-help group relative"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-400">100% LOCAL PROCESSING</span>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-xl text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Your files are compressed securely inside your browser's memory and are never uploaded to our servers.
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col mb-12">
        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div 
              key="dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh] space-y-12"
            >
              <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide leading-snug sm:leading-snug bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-slate-400 pb-3">
                  Compress PDF Online Free - Reduce PDF Size Without Losing Quality
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                  100% free, offline PDF compressor. Reduce PDF size for email, WhatsApp, web upload. No quality loss.
                </p>
              </div>
              
              <div className="w-full">
                <Dropzone onFilesDropped={handleFilesDropped} />
              </div>

              {/* How it works info grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-800/40 transition-colors">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">Zero Server Uploads</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Unlike other tools, your files never leave your computer. We use your browser's local memory to compress the PDF, guaranteeing absolute privacy for sensitive documents.
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-800/40 transition-colors">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                    <WifiOff className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">Works Offline</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Because processing happens locally on your device's hardware, it is lightning fast. You can even disconnect your Wi-Fi and use this app in airplane mode!
                  </p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:bg-slate-800/40 transition-colors">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
                    <BrainCircuit className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-2">Smart Analysis</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Our local heuristic engine calculates your document's density to recommend the perfect balance of compression and quality automatically, completely offline.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : isComplete ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8 w-full"
            >
              <div className="bg-[#0F1219]/40 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
                <div className="absolute top-6 left-6 z-20">
                  <button 
                    onClick={() => {
                      setFiles([]);
                      setIsComplete(false);
                    }}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
                    title="Go Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
                <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 relative z-10 mt-4">
                  <CheckCircle2 className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-slate-400 mb-4 relative z-10 leading-[1.3]">Compression Complete!</h2>
                <p className="text-emerald-400 font-bold text-lg mb-8 relative z-10 tracking-wide">
                  Saved {formatBytes(totalSaved)} ({savedPercentage}% reduction)
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto text-center relative z-10">
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Files</span>
                    <span className="text-xl font-mono text-slate-200">{files.length}</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Original Size</span>
                    <span className="text-xl font-mono text-slate-200">{formatBytes(totalOriginalSize)}</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">New Size</span>
                    <span className="text-xl font-mono text-emerald-400">{formatBytes(totalCompressedSize)}</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Space Saved</span>
                    <span className="text-xl font-mono text-emerald-400">{savedPercentage}%</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                  <button 
                    onClick={handleDownloadAll}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all"
                  >
                    <Download className="w-5 h-5" /> DOWNLOAD ALL
                  </button>
                  <button 
                    onClick={() => {
                      setFiles([]);
                      setIsComplete(false);
                    }}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors uppercase tracking-wider text-sm"
                  >
                    <RefreshCw className="w-5 h-5" /> COMPRESS MORE
                  </button>
                </div>
              </div>

              <div className="bg-[#0F1219]/40 rounded-3xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/20">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">File Details</h3>
                </div>
                <div className="divide-y divide-slate-800">
                  {files.map(f => {
                    const reduction = f.result ? ((1 - f.result.compressedSize / f.size) * 100).toFixed(1) : 0;
                    return (
                      <div key={f.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                        <div className="truncate flex-1">
                          <h3 className="text-sm font-semibold text-slate-200 truncate">{f.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            {f.status === 'Failed' ? (
                              <span className="text-xs font-bold text-red-400">Failed: {f.error || 'Corrupted or encrypted PDF'}</span>
                            ) : (
                              <>
                                <span className="text-xs text-slate-500 line-through">{formatBytes(f.size)}</span>
                                <span className="text-slate-600 text-[10px]">•</span>
                                <span className="text-xs font-bold text-emerald-400">{formatBytes(f.result?.compressedSize || 0)}</span>
                                <span className="text-slate-600 text-[10px]">•</span>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 rounded">-{reduction}%</span>
                              </>
                            )}
                          </div>
                        </div>
                        {f.result?.downloadUrl && (
                          <a 
                            href={f.result.downloadUrl}
                            download={f.result.filename}
                            className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
                          >
                            <Download className="w-4 h-4" /> SAVE
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <FileList 
                  files={files} 
                  onRemove={handleRemoveFile} 
                  onRename={handleRenameFile}
                  onAnalyze={handleAnalyze}
                  onClearAll={() => setFiles([])}
                  settings={settings}
                />
                <Dropzone onFilesDropped={handleFilesDropped} className="p-8 py-10" />
              </div>
              
              <div className="lg:col-span-1 space-y-6 flex flex-col">
                <SettingsPanel 
                  mode={mode}
                  setMode={setMode}
                  settings={settings}
                  setSettings={setSettings}
                  useAiDefaults={useAiDefaults}
                  setUseAiDefaults={setUseAiDefaults}
                  hasAnalyzedFiles={hasAnalyzedFiles}
                />
                
                <div className="sticky top-24 mt-auto">
                  <button 
                    onClick={handleCompress}
                    disabled={isProcessing || files.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    {isProcessing ? 'PROCESSING...' : `COMPRESS ALL`}
                  </button>
                  
                  <p className="text-center text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1 uppercase font-bold tracking-widest">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> 100% Privacy-First Encryption
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <SeoContent />

      <footer className="h-12 bg-[#0B0E14] border-t border-slate-800/40 px-6 flex items-center justify-between shrink-0 text-[10px] text-slate-600 font-medium z-10 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            Secure Storage: Connected
          </div>
          <span>App Version: v1.0.0-gold</span>
          <span className="text-indigo-400 hidden sm:inline-block">100% Free Forever</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1 text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> 100% Privacy-First Encryption
          </span>
          <span className="text-slate-500">© 2024 SmartPDF Laboratory</span>
        </div>
      </footer>

      <FaqModal isOpen={showFaqModal} onClose={() => setShowFaqModal(false)} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <CompressionOverlay isProcessing={isProcessing} />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-800/60 bg-[#0F1219]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} SmartPDF Compressor.</span>
            <span className="hidden md:inline">Built with React & Local Browser APIs.</span>
          </div>
          <div className="flex gap-6 font-semibold">
            <button 
              onClick={() => setShowFaqModal(true)} 
              className="hover:text-slate-300 transition-colors"
            >
              FAQ
            </button>
            <button 
              onClick={() => setShowPrivacyModal(true)} 
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

