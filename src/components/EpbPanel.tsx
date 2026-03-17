import React, { useState } from 'react';
import { Power, AlertCircle, RefreshCw, CheckCircle2, Sliders, ShieldAlert } from 'lucide-react';

interface EpbPanelProps {
  isConnected: boolean;
}

export function EpbPanel({ isConnected }: EpbPanelProps) {
  const [mode, setMode] = useState<'normal' | 'service'>('normal');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleServiceMode = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setMode(mode === 'normal' ? 'service' : 'normal');
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="hardware-card p-4 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Power className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Electronic Parking Brake</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">EPB Service & Maintenance</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
          mode === 'service' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {mode === 'service' ? 'Service Mode Active' : 'Normal Operation'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hardware-card p-6 bg-slate-900/30 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maintenance Actions</h3>
            <div className="space-y-3">
              <button
                disabled={!isConnected || isProcessing}
                onClick={toggleServiceMode}
                className={`w-full py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center border ${
                  mode === 'normal' 
                    ? 'bg-amber-600/20 text-amber-400 border-amber-500/30 hover:bg-amber-600/30' 
                    : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'
                }`}
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sliders className="w-4 h-4 mr-2" />}
                {mode === 'normal' ? 'Enter Service Mode (Retract)' : 'Exit Service Mode (Calibrate)'}
              </button>
              <button
                disabled={!isConnected || isProcessing || mode === 'normal'}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center"
              >
                Reset Brake Pad Thickness
              </button>
            </div>
          </div>

          <div className="hardware-card p-6 bg-slate-900/30 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safety Warnings</h3>
            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg space-y-3">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-rose-300/80 leading-relaxed uppercase tracking-tight">
                  Ensure vehicle is on level ground and wheels are chocked before retracting calipers.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-rose-300/80 leading-relaxed uppercase tracking-tight">
                  Do not apply brake pedal while in service mode.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <RefreshCw className="w-12 h-12 text-vcx-blue animate-spin" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Communicating with EPB Module...</p>
          </div>
        )}

        {!isConnected && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300/80 leading-relaxed italic uppercase tracking-wider">
              Interface connection required for EPB service operations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
