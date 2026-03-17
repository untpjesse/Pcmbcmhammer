import React, { useState, useRef, useEffect } from 'react';
import { Beaker, Play, Square, FastForward, TerminalSquare, AlertTriangle, Cpu } from 'lucide-react';

interface PrototypePanelProps {
  isConnected: boolean;
  onSendCommand: (hexString: string) => void;
}

export function PrototypePanel({ isConnected, onSendCommand }: PrototypePanelProps) {
  // Script Runner State
  const [script, setScript] = useState('10 03\n27 01\n28 03 01\n85 01 02');
  const [isRunningScript, setIsRunningScript] = useState(false);
  const scriptAbortController = useRef<AbortController | null>(null);

  // Fuzzer State
  const [fuzzId, setFuzzId] = useState('7E0');
  const [isFuzzing, setIsFuzzing] = useState(false);
  const fuzzerInterval = useRef<NodeJS.Timeout | null>(null);

  // Brute Force State
  const [bruteForceService, setBruteForceService] = useState('27 01');
  const [isBruteForcing, setIsBruteForcing] = useState(false);
  const bruteForceInterval = useRef<NodeJS.Timeout | null>(null);

  const runScript = async () => {
    if (!isConnected) return;
    setIsRunningScript(true);
    scriptAbortController.current = new AbortController();
    const signal = scriptAbortController.current.signal;

    const lines = script.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('//'));
    
    try {
      for (const line of lines) {
        if (signal.aborted) break;
        onSendCommand(line.trim());
        // Wait 500ms between commands
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } finally {
      setIsRunningScript(false);
    }
  };

  const stopScript = () => {
    if (scriptAbortController.current) {
      scriptAbortController.current.abort();
    }
    setIsRunningScript(false);
  };

  const toggleFuzzer = () => {
    if (isFuzzing) {
      if (fuzzerInterval.current) clearInterval(fuzzerInterval.current);
      setIsFuzzing(false);
    } else {
      setIsFuzzing(true);
      fuzzerInterval.current = setInterval(() => {
        // Generate random 8 bytes payload
        const payload = Array.from({length: 8}, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
        ).join(' ');
        onSendCommand(`${fuzzId} ${payload}`);
      }, 100); // 100ms interval for fuzzing
    }
  };

  const toggleBruteForce = () => {
    if (isBruteForcing) {
      if (bruteForceInterval.current) clearInterval(bruteForceInterval.current);
      setIsBruteForcing(false);
    } else {
      setIsBruteForcing(true);
      let attempt = 0;
      bruteForceInterval.current = setInterval(() => {
        // Simulate sending a key attempt (e.g., 27 02 [Key])
        const key = attempt.toString(16).padStart(4, '0').toUpperCase();
        const keyBytes = key.match(/.{1,2}/g)?.join(' ') || '00 00';
        
        // Send the seed request, then the key (in a real scenario we'd wait for the seed)
        // For prototyping UI, we just spam the key response
        onSendCommand(`27 02 ${keyBytes}`);
        attempt++;
        if (attempt > 0xFFFF) attempt = 0;
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (fuzzerInterval.current) clearInterval(fuzzerInterval.current);
      if (bruteForceInterval.current) clearInterval(bruteForceInterval.current);
      if (scriptAbortController.current) scriptAbortController.current.abort();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Beaker className="w-5 h-5 mr-2 text-pink-500" />
          Experimental Prototypes
        </h2>
        {!isConnected && (
          <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            Connect to use prototypes
          </span>
        )}
      </div>

      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/70">
          <strong className="text-amber-500 font-semibold">Warning:</strong> These features are highly experimental. Fuzzing or brute-forcing can cause unpredictable behavior, module lockups, or battery drain on a live vehicle network. Use on a bench setup only.
        </p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Macro / Scripting Engine */}
        <div className="space-y-4 lg:col-span-2 xl:col-span-1">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center">
            <TerminalSquare className="w-4 h-4 mr-2" />
            Macro Scripting Engine
          </h3>
          
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 flex flex-col h-64">
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={isRunningScript || !isConnected}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-pink-500 font-mono resize-none mb-4"
              placeholder="// Enter hex commands, one per line&#10;10 03&#10;27 01"
            />
            <div className="flex space-x-3">
              {!isRunningScript ? (
                <button
                  onClick={runScript}
                  disabled={!isConnected || !script.trim()}
                  className="flex-1 flex items-center justify-center p-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-emerald-400 hover:text-emerald-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Run Sequence</span>
                </button>
              ) : (
                <button
                  onClick={stopScript}
                  className="flex-1 flex items-center justify-center p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors text-red-400 hover:text-red-300"
                >
                  <Square className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Stop Sequence</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* CAN Fuzzer */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center">
              <FastForward className="w-4 h-4 mr-2" />
              CAN Bus Fuzzer
            </h3>
            
            <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Target CAN ID (Hex)</label>
                <input
                  type="text"
                  value={fuzzId}
                  onChange={(e) => setFuzzId(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                  disabled={isFuzzing || !isConnected}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-pink-500 font-mono"
                  placeholder="e.g., 7E0"
                />
              </div>
              
              <button
                onClick={toggleFuzzer}
                disabled={!isConnected || !fuzzId}
                className={`w-full flex items-center justify-center p-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFuzzing 
                    ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-400' 
                    : 'bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/30 text-pink-400'
                }`}
              >
                {isFuzzing ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Stop Fuzzing</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Start Fuzzing (100ms)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security Brute Forcer */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              Security Brute Forcer
            </h3>
            
            <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 font-medium">Seed Request Service</label>
                <input
                  type="text"
                  value={bruteForceService}
                  onChange={(e) => setBruteForceService(e.target.value)}
                  disabled={isBruteForcing || !isConnected}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-pink-500 font-mono"
                  placeholder="e.g., 27 01"
                />
              </div>
              
              <button
                onClick={toggleBruteForce}
                disabled={!isConnected || !bruteForceService}
                className={`w-full flex items-center justify-center p-3 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isBruteForcing 
                    ? 'bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-400' 
                    : 'bg-pink-600/20 hover:bg-pink-600/30 border-pink-500/30 text-pink-400'
                }`}
              >
                {isBruteForcing ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Stop Attack</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Start Attack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
