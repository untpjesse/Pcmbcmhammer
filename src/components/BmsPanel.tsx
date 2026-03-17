import React, { useState } from 'react';
import { Battery, Zap, Activity, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BmsPanelProps {
  isConnected: boolean;
}

export function BmsPanel({ isConnected }: BmsPanelProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [step, setStep] = useState(0);

  const handleReset = () => {
    setIsResetting(true);
    setStep(1);
    setTimeout(() => setStep(2), 2000);
    setTimeout(() => setStep(3), 4000);
    setTimeout(() => {
      setIsResetting(false);
      setStep(4);
    }, 6000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="hardware-card p-4 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Battery className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Battery Management</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">BMS Registration & Reset</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hardware-card p-6 bg-slate-900/30 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">State of Charge</span>
                <span className="text-xs font-mono text-emerald-400">84%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Battery Health</span>
                <span className="text-xs font-mono text-emerald-400">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Cycle Count</span>
                <span className="text-xs font-mono text-slate-300">142</span>
              </div>
            </div>
          </div>

          <div className="hardware-card p-6 bg-slate-900/30 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Battery Specs</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Capacity</span>
                <span className="text-xs font-mono text-slate-300">80 Ah</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Technology</span>
                <span className="text-xs font-mono text-slate-300">AGM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase">Manufacturer</span>
                <span className="text-xs font-mono text-slate-300">VARTA</span>
              </div>
            </div>
          </div>

          <div className="hardware-card p-6 bg-slate-900/30 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration</h3>
            <button
              disabled={!isConnected || isResetting}
              onClick={handleReset}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center"
            >
              {isResetting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Register New Battery
            </button>
          </div>
        </div>

        {isResetting && (
          <div className="hardware-card p-6 border-vcx-blue/30 bg-vcx-blue/5">
            <h3 className="text-[10px] font-bold text-vcx-blue uppercase tracking-widest mb-4">Registration Progress</h3>
            <div className="space-y-4">
              {[
                { id: 1, label: 'Initializing BMS Communication' },
                { id: 2, label: 'Clearing Battery Aging History' },
                { id: 3, label: 'Writing New Battery Parameters' }
              ].map((s) => (
                <div key={s.id} className="flex items-center space-x-3">
                  {step > s.id ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : step === s.id ? (
                    <RefreshCw className="w-4 h-4 text-vcx-blue animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                  <span className={`text-[11px] uppercase tracking-wider ${step >= s.id ? 'text-slate-200' : 'text-slate-600'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && !isResetting && (
          <div className="hardware-card p-4 bg-emerald-500/10 border-emerald-500/20 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest">Battery Registered Successfully</p>
          </div>
        )}

        {!isConnected && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300/80 leading-relaxed italic uppercase tracking-wider">
              Interface connection required for BMS operations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
