import React, { useState, useEffect } from 'react';
import { Network, Search, CheckCircle, AlertTriangle, XCircle, Cpu } from 'lucide-react';

interface NetworkScannerPanelProps {
  isConnected: boolean;
}

interface ModuleInfo {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  dtcCount: number;
}

export function NetworkScannerPanel({ isConnected }: NetworkScannerPanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modules, setModules] = useState<ModuleInfo[]>([]);

  const knownModules = [
    { id: '7E0', name: 'Engine Control Module (ECM)' },
    { id: '7E1', name: 'Transmission Control Module (TCM)' },
    { id: '720', name: 'Instrument Panel Cluster (IPC)' },
    { id: '726', name: 'Body Control Module (BCM)' },
    { id: '760', name: 'Anti-lock Braking System (ABS)' },
    { id: '730', name: 'Power Steering Control Module (PSCM)' },
    { id: '7A0', name: 'Restraint Control Module (RCM)' },
    { id: '7D0', name: 'Accessory Protocol Interface Module (APIM)' },
  ];

  const handleScan = () => {
    if (!isConnected) return;
    setIsScanning(true);
    setProgress(0);
    setModules([]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);

      // Randomly discover modules as progress increases
      if (currentProgress % 15 === 0 && currentProgress <= 100) {
        const index = (currentProgress / 15) - 1;
        if (index < knownModules.length) {
          const isOffline = Math.random() > 0.8;
          const hasError = !isOffline && Math.random() > 0.7;
          
          setModules(prev => [...prev, {
            ...knownModules[index],
            status: isOffline ? 'offline' : (hasError ? 'error' : 'online'),
            dtcCount: hasError ? Math.floor(Math.random() * 5) + 1 : 0
          }]);
        }
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 100);
  };

  useEffect(() => {
    if (!isConnected) {
      setIsScanning(false);
      setModules([]);
      setProgress(0);
    }
  }, [isConnected]);

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Network className="w-5 h-5 mr-2 text-indigo-500" />
          Network Topology Scanner
        </h2>
        <button
          onClick={handleScan}
          disabled={!isConnected || isScanning}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Search className="w-4 h-4 mr-2" />
          {isScanning ? 'Scanning...' : 'Scan Network'}
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Network className="w-12 h-12 mb-4 opacity-20" />
            <p>Connect to a vehicle to scan the network topology.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {isScanning && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-zinc-400">
                  <span>Pinging CAN IDs...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {modules.map((mod, idx) => (
                <div key={idx} className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    mod.status === 'online' ? 'bg-emerald-500/10 text-emerald-500' :
                    mod.status === 'error' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-200 truncate" title={mod.name}>
                      {mod.name}
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono mt-1">ID: 0x{mod.id}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      {mod.status === 'online' && (
                        <span className="flex items-center text-xs font-medium text-emerald-400">
                          <CheckCircle className="w-3 h-3 mr-1" /> Online
                        </span>
                      )}
                      {mod.status === 'error' && (
                        <span className="flex items-center text-xs font-medium text-amber-400">
                          <AlertTriangle className="w-3 h-3 mr-1" /> {mod.dtcCount} DTCs
                        </span>
                      )}
                      {mod.status === 'offline' && (
                        <span className="flex items-center text-xs font-medium text-zinc-500">
                          <XCircle className="w-3 h-3 mr-1" /> Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!isScanning && modules.length > 0 && (
              <div className="text-center text-xs text-zinc-500 mt-8">
                Scan complete. Found {modules.length} modules.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
