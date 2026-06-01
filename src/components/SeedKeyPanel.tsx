import React, { useState } from 'react';
import { Key, Unlock, Cpu, Check, Shield } from 'lucide-react';
import { ALGORITHMS, SeedKeyAlgorithm } from '../lib/security';

export function SeedKeyPanel() {
  const [seed, setSeed] = useState('');
  const [secret, setSecret] = useState('');
  const [calculatedKey, setCalculatedKey] = useState<string | null>(null);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(ALGORITHMS[0].id);

  const handleCalculate = () => {
    const algo = ALGORITHMS.find(a => a.id === selectedAlgoId);
    if (!algo || !seed.trim()) return;

    try {
      const result = algo.calculate(seed, secret);
      setCalculatedKey(result);
    } catch (e) {
      setCalculatedKey('Error calculating key');
    }
  };

  const copyToClipboard = () => {
    if (calculatedKey) {
      navigator.clipboard.writeText(calculatedKey);
    }
  };

  const selectedAlgo = ALGORITHMS.find(a => a.id === selectedAlgoId);

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center">
          <Key className="w-5 h-5 mr-2 text-yellow-400" />
          Seed/Key Security Access Calculator
        </h2>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start space-x-3">
            <Shield className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-1">Security Access (Service $27)</h3>
              <p className="text-xs text-yellow-300/[0.85] leading-relaxed">
                Calculate the required unlock key for diagnostic security access. Enter the challenge seed provided by the module to generate the correct unlocking response key based on the manufacturer's algorithm.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Algorithm Selection</label>
              <select 
                value={selectedAlgoId}
                onChange={(e) => setSelectedAlgoId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-yellow-500/50"
              >
                {ALGORITHMS.map(algo => (
                  <option key={algo.id} value={algo.id}>{algo.name}</option>
                ))}
              </select>
              {selectedAlgo && (
                <p className="mt-2 text-xs text-slate-500">{selectedAlgo.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Seed (Hex)</label>
                <input 
                  type="text" 
                  value={seed}
                  onChange={(e) => setSeed(e.target.value.replace(/[^0-9A-Fa-f\s]/g, ''))}
                  placeholder="e.g. 1A 2B 3C 4D"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 font-mono focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Secret Key Mask <span className="text-slate-500 text-xs font-normal">(Optional/Variant)</span>
                </label>
                <input 
                  type="text" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value.replace(/[^0-9A-Fa-f\s]/g, ''))}
                  placeholder="e.g. 27 11"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 font-mono focus:outline-none focus:border-yellow-500/50"
                />
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={!seed.trim()}
              className="w-full py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded-lg font-medium text-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.1)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Cpu className="w-5 h-5 mr-2" />
              Calculate Key
            </button>
          </div>

          {calculatedKey && (
            <div className="bg-slate-900 rounded-xl p-6 border border-yellow-500/30 flex flex-col items-center justify-center space-y-4">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Calculated Response Key</span>
              <div className="text-4xl font-mono text-yellow-400 tracking-wider font-bold">
                {calculatedKey}
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center space-x-2 text-sm text-yellow-500/80 hover:text-yellow-400 transition-colors"
              >
                <span>Copy to Clipboard</span>
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
