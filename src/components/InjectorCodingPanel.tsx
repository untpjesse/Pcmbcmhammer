import React, { useState, useEffect } from 'react';
import { Cpu, Edit3, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InjectorCodingPanelProps {
  isConnected: boolean;
}

interface Injector {
  cylinder: number;
  code: string;
  newCode: string;
  status: 'idle' | 'writing' | 'success' | 'error';
}

export function InjectorCodingPanel({ isConnected }: InjectorCodingPanelProps) {
  const [injectors, setInjectors] = useState<Injector[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isWritingAll, setIsWritingAll] = useState(false);

  useEffect(() => {
    if (isConnected && injectors.length === 0) {
      handleReadInjectors();
    }
  }, [isConnected]);

  const handleReadInjectors = () => {
    if (!isConnected) return;
    setIsReading(true);
    
    setTimeout(() => {
      setInjectors([
        { cylinder: 1, code: '7A3B9C', newCode: '7A3B9C', status: 'idle' },
        { cylinder: 2, code: '8F2D1E', newCode: '8F2D1E', status: 'idle' },
        { cylinder: 3, code: '9E4C2A', newCode: '9E4C2A', status: 'idle' },
        { cylinder: 4, code: '6B1A8F', newCode: '6B1A8F', status: 'idle' },
      ]);
      setIsReading(false);
    }, 1500);
  };

  const handleCodeChange = (cylinder: number, value: string) => {
    setInjectors(prev => prev.map(inj => 
      inj.cylinder === cylinder ? { ...inj, newCode: value.toUpperCase() } : inj
    ));
  };

  const handleWriteInjector = (cylinder: number) => {
    if (!isConnected) return;
    
    setInjectors(prev => prev.map(inj => 
      inj.cylinder === cylinder ? { ...inj, status: 'writing' } : inj
    ));

    setTimeout(() => {
      setInjectors(prev => prev.map(inj => 
        inj.cylinder === cylinder ? { ...inj, status: 'success', code: inj.newCode } : inj
      ));
      
      setTimeout(() => {
        setInjectors(prev => prev.map(inj => 
          inj.cylinder === cylinder ? { ...inj, status: 'idle' } : inj
        ));
      }, 3000);
    }, 1500);
  };

  const handleWriteAll = () => {
    if (!isConnected) return;
    setIsWritingAll(true);
    
    setInjectors(prev => prev.map(inj => ({ ...inj, status: 'writing' })));

    setTimeout(() => {
      setInjectors(prev => prev.map(inj => ({ ...inj, status: 'success', code: inj.newCode })));
      setIsWritingAll(false);
      
      setTimeout(() => {
        setInjectors(prev => prev.map(inj => ({ ...inj, status: 'idle' })));
      }, 3000);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-orange-500" />
          Injector Coding (IMA/IQA)
        </h2>
        <button
          onClick={handleReadInjectors}
          disabled={!isConnected || isReading || isWritingAll}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isReading ? 'animate-spin' : ''}`} />
          Read Codes
        </button>
      </div>

      <div className="p-4 bg-orange-500/10 border-b border-orange-500/20 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-orange-200/70">
          Enter the alphanumeric compensation codes printed on the fuel injectors. Incorrect codes can cause rough idle, poor performance, and DPF failure.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {injectors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Cpu className="w-12 h-12 mb-4 opacity-20" />
              <p>Click "Read Codes" to fetch current injector data from the ECM.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {injectors.map((inj) => (
                  <div key={inj.cylinder} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-zinc-900 rounded-lg border border-zinc-800">
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Cyl</span>
                        <span className="text-2xl font-bold text-zinc-200">{inj.cylinder}</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Current Stored Code</label>
                        <div className="text-lg font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded border border-zinc-800 inline-block">
                          {inj.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">New Code</label>
                        <div className="relative">
                          <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            value={inj.newCode}
                            onChange={(e) => handleCodeChange(inj.cylinder, e.target.value)}
                            maxLength={10}
                            disabled={inj.status === 'writing' || isWritingAll}
                            className="w-40 bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-sm font-mono text-zinc-200 focus:outline-none focus:border-orange-500 uppercase"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleWriteInjector(inj.cylinder)}
                        disabled={!isConnected || inj.status === 'writing' || isWritingAll || inj.code === inj.newCode}
                        className={`px-4 py-2 mt-5 rounded-lg text-sm font-medium transition-all flex items-center w-32 justify-center ${
                          inj.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          inj.status === 'writing' ? 'bg-orange-600/50 text-white cursor-wait' :
                          'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50'
                        }`}
                      >
                        {inj.status === 'writing' ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 
                         inj.status === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : 
                         <Save className="w-4 h-4 mr-2" />}
                        {inj.status === 'writing' ? 'Writing...' : 
                         inj.status === 'success' ? 'Saved' : 'Write'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleWriteAll}
                  disabled={!isConnected || isWritingAll || injectors.every(inj => inj.code === inj.newCode)}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  {isWritingAll ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Write All Changed Codes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
