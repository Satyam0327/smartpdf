import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FileText } from 'lucide-react';

interface PdfThumbnailProps {
  file: File;
}

export function PdfThumbnail({ file }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null;
    let isActive = true;

    const renderThumbnail = async () => {
      if (!canvasRef.current) return;
      
      try {
        setLoading(true);
        setError(false);
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        if (!isActive) return;
        
        // Get the first page
        const page = await pdfDoc.getPage(1);
        if (!isActive) return;

        // Render at a small scale for thumbnail
        const viewport = page.getViewport({ scale: 0.3 });
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
        
      } catch (err) {
        console.error("Error generating thumbnail:", err);
        if (isActive) setError(true);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    renderThumbnail();

    return () => {
      isActive = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [file]);

  if (error || loading) {
    return (
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/10 text-red-500 rounded-lg shrink-0 flex items-center justify-center border border-red-500/20">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shrink-0 flex items-center justify-center overflow-hidden border border-slate-700 shadow-sm relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover rounded-lg"
      />
      {/* Small gradient overlay so it blends nicer with the dark theme UI */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay pointer-events-none rounded-lg" />
    </div>
  );
}
