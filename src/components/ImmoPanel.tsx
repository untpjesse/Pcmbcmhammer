import React, { useState } from 'react';
import { Key, ShieldAlert, Unlock, ShieldCheck, AlertTriangle, RefreshCw, Search } from 'lucide-react';

interface ImmoPanelProps {
  isConnected: boolean;
}

export function ImmoPanel({ isConnected }: ImmoPanelProps) {
  const [pin, setPin] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isProgramming, setIsProgramming] = useState(false);
  const [keysProgrammed, setKeysProgrammed] = useState(2);
  const [immoStatus, setImmoStatus] = useState<'locked' | 'unlocked'>('locked');

  const handleReadPin = () => {
    if (!isConnected) return;
    setIsReading(true);
    setTimeout(() => {
      setPin(Math.floor(1000 + Math.random() * 9000).toString());
      setIsReading(false);
    }, 2500);
  };

  const handleUnlock = () => {
    if (!isConnected || !pin) return;
    setIsProgramming(true);
    setTimeout(() => {
      setImmoStatus('unlocked');
      setIsProgramming(false);
    }, 1500);
  };

  const handleProgramKey = () => {
    if (!isConnected || immoStatus !== 'unlocked') return;
    setIsProgramming(true);
    setTimeout(() => {
      setKeysProgrammed(prev => prev + 1);
      setIsProgramming(false);
      alert('New key successfully programmed to the immobilizer.');
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Key className="w-5 h-5 mr-2 text-amber-500" />
          Immobilizer & Keys
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${
          immoStatus === 'unlocked' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {immoStatus === 'unlocked' ? <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> : <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />}
          {immoStatus === 'unlocked' ? 'Security Access Granted' : 'Security Locked'}
        </div>
      </div>

      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/70">
          <strong className="text-amber-500 font-semibold">Warning:</strong> Immobilizer functions can permanently disable the vehicle if interrupted. Ensure battery voltage is stable ({'>'}12.5V) before proceeding.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Status Card */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Keys Programmed</h3>
              <p className="text-3xl font-light text-zinc-100 mt-1">{keysProgrammed}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-zinc-400">Immo Status</h3>
              <p className="text-lg font-medium text-zinc-100 mt-1 uppercase tracking-wider">
                {immoStatus === 'locked' ? 'Active' : 'Bypassed'}
              </p>
            </div>
          </div>

          {/* Step 1: Read PIN */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-base font-medium text-zinc-200 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs mr-3">1</span>
              Retrieve Security PIN
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReadPin}
                disabled={!isConnected || isReading}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                {isReading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                Read PIN / SKC
              </button>
              {pin && (
                <div className="flex items-center px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg">
                  <span className="text-xs text-zinc-500 mr-3 uppercase tracking-wider">PIN:</span>
                  <span className="text-lg font-mono text-amber-400 tracking-widest">{pin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Unlock */}
          <div className={`bg-zinc-950/50 border rounded-xl p-6 transition-colors ${pin ? 'border-zinc-700' : 'border-zinc-800 opacity-50'}`}>
            <h3 className="text-base font-medium text-zinc-200 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs mr-3">2</span>
              Security Access
            </h3>
            <button
              onClick={handleUnlock}
              disabled={!isConnected || !pin || immoStatus === 'unlocked' || isProgramming}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              <Unlock className="w-4 h-4 mr-2" />
              {immoStatus === 'unlocked' ? 'Access Granted' : 'Request Security Access'}
            </button>
          </div>

          {/* Step 3: Program */}
          <div className={`bg-zinc-950/50 border rounded-xl p-6 transition-colors ${immoStatus === 'unlocked' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-zinc-800 opacity-50'}`}>
            <h3 className="text-base font-medium text-zinc-200 mb-4 flex items-center">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs mr-3">3</span>
              Key Programming
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Insert the new unprogrammed key into the ignition and turn to the ON position (Engine OFF).
            </p>
            <button
              onClick={handleProgramKey}
              disabled={!isConnected || immoStatus !== 'unlocked' || isProgramming}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Key className="w-4 h-4 mr-2" />
              Program Current Key
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
