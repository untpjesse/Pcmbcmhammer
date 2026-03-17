import React, { useState, useEffect } from 'react';
import { Sliders, Save, RefreshCw, AlertCircle } from 'lucide-react';

interface VariantCodingPanelProps {
  isConnected: boolean;
}

interface CodingOption {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'select';
  value: any;
  options?: { label: string; value: string }[];
}

export function VariantCodingPanel({ isConnected }: VariantCodingPanelProps) {
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [options, setOptions] = useState<CodingOption[]>([
    { id: 'drl', name: 'Daytime Running Lights', description: 'Enable/Disable DRLs via low beams', type: 'boolean', value: false },
    { id: 'chime', name: 'Seatbelt Chime', description: 'Warning chime when seatbelt is unbuckled', type: 'boolean', value: true },
    { id: 'windows', name: 'Global Windows', description: 'Open/Close windows via key fob', type: 'boolean', value: false },
    { id: 'region', name: 'Vehicle Region', description: 'Market specific lighting and warnings', type: 'select', value: 'na', options: [
      { label: 'North America (NA)', value: 'na' },
      { label: 'Europe (EU)', value: 'eu' },
      { label: 'Japan (JP)', value: 'jp' }
    ]},
    { id: 'battery', name: 'Battery Type', description: 'Battery chemistry for BMS', type: 'select', value: 'agm', options: [
      { label: 'Standard Flooded (FLA)', value: 'fla' },
      { label: 'Absorbent Glass Mat (AGM)', value: 'agm' },
      { label: 'Lithium Ion (Li-Ion)', value: 'li' }
    ]}
  ]);

  const handleRead = () => {
    if (!isConnected) return;
    setIsReading(true);
    setTimeout(() => {
      // Randomize slightly to simulate reading actual vehicle state
      setOptions(prev => prev.map(opt => {
        if (opt.type === 'boolean') return { ...opt, value: Math.random() > 0.5 };
        return opt;
      }));
      setIsReading(false);
    }, 1200);
  };

  const handleWrite = () => {
    if (!isConnected) return;
    setIsWriting(true);
    setTimeout(() => {
      setIsWriting(false);
      alert('Coding successfully written to module.');
    }, 2000);
  };

  const updateOption = (id: string, newValue: any) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, value: newValue } : opt));
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Sliders className="w-5 h-5 mr-2 text-fuchsia-500" />
          Variant Coding (As-Built)
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRead}
            disabled={!isConnected || isReading || isWriting}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center border border-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isReading ? 'animate-spin' : ''}`} />
            Read Coding
          </button>
          <button
            onClick={handleWrite}
            disabled={!isConnected || isReading || isWriting}
            className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Write Coding
          </button>
        </div>
      </div>

      <div className="p-4 bg-fuchsia-500/10 border-b border-fuchsia-500/20 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-fuchsia-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-fuchsia-200/70">
          Modify module configuration parameters. Incorrect settings may cause module malfunction or warning lights. Always backup original coding before making changes.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {options.map(option => (
            <div key={option.id} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors">
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-medium text-zinc-200">{option.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{option.description}</p>
              </div>
              <div className="w-48 flex justify-end">
                {option.type === 'boolean' ? (
                  <button
                    onClick={() => updateOption(option.id, !option.value)}
                    disabled={!isConnected}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      option.value ? 'bg-fuchsia-500' : 'bg-zinc-700'
                    } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      option.value ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                ) : (
                  <select
                    value={option.value}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    disabled={!isConnected}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 px-3 text-sm text-zinc-300 focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
                  >
                    {option.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
