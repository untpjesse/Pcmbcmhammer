import React, { useState } from 'react';
import { Leaf, AlertCircle, RefreshCw, CheckCircle2, Thermometer, Wind, Flame } from 'lucide-react';

interface DpfPanelProps {
  isConnected: boolean;
}

export function DpfPanel({ isConnected }: DpfPanelProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [sootLevel, setSootLevel] = useState(68);
  const [temp, setTemp] = useState(240);

  const startRegen = () => {
    setIsRegenerating(true);
    let currentSoot = sootLevel;
    let currentTemp = temp;
    
    const interval = setInterval(() => {
      if (currentTemp < 600) currentTemp += 15;
      if (currentTemp >= 550) currentSoot -= 1;
      
      setSootLevel(Math.max(0, currentSoot));
      setTemp(currentTemp);
      
      if (currentSoot <= 5) {
        clearInterval(interval);
        setIsRegenerating(false);
        setTemp(350);
      }
    }, 500);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="hardware-card p-4 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Leaf className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Diesel Particulate Filter</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">DPF Regeneration & Monitoring</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hardware-card p-6 bg-slate-900/30 space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Soot Accumulation</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full text-orange-400 bg-orange-500/10">
                    {sootLevel > 80 ? 'Critical' : sootLevel > 50 ? 'High' : 'Normal'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold inline-block text-white font-mono">
                    {sootLevel}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
                <div 
                  style={{ width: `${sootLevel}%` }} 
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                    sootLevel > 80 ? 'bg-rose-500' : sootLevel > 50 ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-wider">
                <span className="text-slate-500">Differential Pressure</span>
                <span className="text-slate-300 font-mono">12.4 kPa</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider">
                <span className="text-slate-500">Ash Accumulation</span>
                <span className="text-slate-300 font-mono">42 g</span>
              </div>
            </div>
          </div>

          <div className="hardware-card p-6 bg-slate-900/30 space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thermal Status</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <Thermometer className={`w-12 h-12 ${temp > 500 ? 'text-rose-500 animate-pulse' : 'text-orange-400'}`} />
                <div className="absolute -top-2 -right-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span className="text-xs font-bold font-mono text-white">{temp}°C</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-2 bg-slate-950/50 rounded border border-slate-800">
                  <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">EGT Sensor 1</p>
                  <p className="text-[10px] font-mono text-slate-300">{temp - 40}°C</p>
                </div>
                <div className="text-center p-2 bg-slate-950/50 rounded border border-slate-800">
                  <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">EGT Sensor 2</p>
                  <p className="text-[10px] font-mono text-slate-300">{temp + 20}°C</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hardware-card p-6 bg-slate-900/30 space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Actions</h3>
            <div className="space-y-3">
              <button
                disabled={!isConnected || isRegenerating || sootLevel < 20}
                onClick={startRegen}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center shadow-lg shadow-orange-500/10"
              >
                {isRegenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Flame className="w-4 h-4 mr-2" />}
                Service Regeneration
              </button>
              <button
                disabled={!isConnected || isRegenerating}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center"
              >
                Reset DPF Values
              </button>
            </div>
            {isRegenerating && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <p className="text-[9px] text-rose-400 font-bold uppercase text-center animate-pulse">Regeneration in Progress - High EGT!</p>
              </div>
            )}
          </div>
        </div>

        {!isConnected && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300/80 leading-relaxed italic uppercase tracking-wider">
              Interface connection required for DPF service.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
