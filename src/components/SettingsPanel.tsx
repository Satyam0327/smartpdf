import React from 'react';
import { CompressionMode, CompressionSettings } from '../types';
import { Settings2, Zap, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
  mode: CompressionMode;
  setMode: (mode: CompressionMode) => void;
  settings: CompressionSettings;
  setSettings: (settings: CompressionSettings) => void;
  useAiDefaults: boolean;
  setUseAiDefaults: (use: boolean) => void;
  hasAnalyzedFiles: boolean;
}

export function SettingsPanel({
  mode,
  setMode,
  settings,
  setSettings,
  useAiDefaults,
  setUseAiDefaults,
  hasAnalyzedFiles
}: SettingsPanelProps) {
  
  return (
    <div className="w-full bg-[#0F1219] rounded-2xl border border-slate-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Compression Mode</h2>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setMode('TargetSize')}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all",
              mode === 'TargetSize'
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-100"
                : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-600"
            )}
          >
            <span>Target File Size</span>
          </button>
          <button
            onClick={() => setMode('UseCase')}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all",
              mode === 'UseCase'
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-100"
                : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-600"
            )}
          >
            <span>Use Case Presets</span>
          </button>
          <button
            onClick={() => setMode('Custom')}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all",
              mode === 'Custom'
                ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-100"
                : "bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-600"
            )}
          >
            <span>Custom Settings</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        {/* Smart Toggle */}
        <label className={cn(
          "flex items-center gap-3 p-4 rounded-xl border transition-colors",
          useAiDefaults && hasAnalyzedFiles
            ? "border-indigo-500/40 bg-indigo-500/10"
            : "border-slate-800 bg-slate-800/40 opacity-70",
          hasAnalyzedFiles && mode === 'Custom' ? "cursor-pointer hover:opacity-100" : "opacity-50 cursor-not-allowed"
        )}>
          <div className={cn(
            "p-2 rounded-lg",
            useAiDefaults && hasAnalyzedFiles ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
          )}>
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-200 text-sm">Smart Recommendations</p>
            <p className="text-xs text-slate-500">
              {!hasAnalyzedFiles 
                ? "Analyze files first" 
                : mode !== 'Custom' 
                  ? "Only available in Custom mode"
                  : "Apply optimal smart settings"}
            </p>
          </div>
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
            checked={useAiDefaults && hasAnalyzedFiles}
            onChange={(e) => setUseAiDefaults(e.target.checked)}
            disabled={!hasAnalyzedFiles || mode !== 'Custom'}
          />
        </label>

        {/* Custom Settings */}
        <div className={cn(
          "space-y-6 transition-all duration-300",
          mode === 'Custom' ? "opacity-100" : "opacity-50 pointer-events-none"
        )}>
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Image Quality
              </label>
              <span className="text-xs font-mono text-indigo-400">{settings.imageQuality}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={settings.imageQuality}
              onChange={(e) => setSettings({ ...settings, imageQuality: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Resolution (DPI)</span>
              <select 
                value={settings.dpi}
                onChange={(e) => setSettings({ ...settings, dpi: parseInt(e.target.value) })}
                className="bg-slate-800 border-none rounded px-2 py-1 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value={72}>72 DPI</option>
                <option value={150}>150 DPI</option>
                <option value={300}>300 DPI</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Color Mode</span>
              <select 
                value={settings.colorMode}
                onChange={(e) => setSettings({ ...settings, colorMode: e.target.value as any })}
                className="bg-slate-800 border-none rounded px-2 py-1 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="RGB">RGB</option>
                <option value="Grayscale">GS</option>
                <option value="B&W">B&W</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.removeMetadata}
                onChange={(e) => setSettings({ ...settings, removeMetadata: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
              />
              <span className="text-xs text-slate-300">Strip Metadata</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
