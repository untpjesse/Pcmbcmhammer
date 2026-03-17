import React, { useState, useEffect } from 'react';
import { Network, Activity, AlertCircle, CheckCircle2, RefreshCw, Server, ShieldAlert } from 'lucide-react';

interface NetworkTopologyPanelProps {
  isConnected: boolean;
}

interface ModuleNode {
  id: string;
  name: string;
  bus: 'HS-CAN' | 'MS-CAN' | 'LIN';
  status: 'online' | 'offline' | 'error';
  dtcCount: number;
  x: number;
  y: number;
}

export function NetworkTopologyPanel({ isConnected }: NetworkTopologyPanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [modules, setModules] = useState<ModuleNode[]>([]);

  const initialModules: ModuleNode[] = [
    { id: 'PCM', name: 'Powertrain Control', bus: 'HS-CAN', status: 'online', dtcCount: 0, x: 20, y: 20 },
    { id: 'TCM', name: 'Transmission Control', bus: 'HS-CAN', status: 'online', dtcCount: 0, x: 20, y: 50 },
    { id: 'ABS', name: 'Anti-lock Brakes', bus: 'HS-CAN', status: 'online', dtcCount: 2, x: 20, y: 80 },
    { id: 'BCM', name: 'Body Control', bus: 'MS-CAN', status: 'online', dtcCount: 1, x: 80, y: 20 },
    { id: 'IPC', name: 'Instrument Cluster', bus: 'MS-CAN', status: 'online', dtcCount: 0, x: 80, y: 50 },
    { id: 'HVAC', name: 'Climate Control', bus: 'MS-CAN', status: 'offline', dtcCount: 0, x: 80, y: 80 },
    { id: 'PDM', name: 'Passenger Door', bus: 'LIN', status: 'online', dtcCount: 0, x: 50, y: 80 },
  ];

  useEffect(() => {
    if (isConnected && modules.length === 0) {
      handleScanNetwork();
    } else if (!isConnected) {
      setModules([]);
    }
  }, [isConnected]);

  const handleScanNetwork = () => {
    if (!isConnected) return;
    setIsScanning(true);
    setModules([]);
    
    setTimeout(() => {
      setModules(initialModules);
      setIsScanning(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Network className="w-5 h-5 mr-2 text-indigo-500" />
          Network Topology Map
        </h2>
        <button
          onClick={handleScanNetwork}
          disabled={!isConnected || isScanning}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
          Scan Network
        </button>
      </div>

      <div className="flex-1 p-6 relative overflow-hidden bg-zinc-950">
        {!isConnected ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
            <Network className="w-16 h-16 mb-4 opacity-20" />
            <p>Connect to a vehicle to view network topology.</p>
          </div>
        ) : isScanning ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-500">
            <RefreshCw className="w-16 h-16 mb-4 animate-spin opacity-80" />
            <p className="text-indigo-400 font-medium">Pinging modules on all buses...</p>
          </div>
        ) : modules.length > 0 ? (
          <div className="relative w-full h-full max-w-4xl mx-auto">
            {/* Bus Lines */}
            <div className="absolute top-10 bottom-10 left-[20%] w-1 bg-red-500/30 rounded-full"></div>
            <div className="absolute top-10 bottom-10 left-[80%] w-1 bg-blue-500/30 rounded-full"></div>
            <div className="absolute top-[80%] left-[20%] right-[20%] h-1 bg-green-500/30 rounded-full"></div>
            
            {/* Gateway / OBD Port */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-16 h-12 bg-zinc-800 border-2 border-zinc-600 rounded-lg flex items-center justify-center shadow-lg z-10">
                <Server className="w-6 h-6 text-zinc-300" />
              </div>
              <span className="text-xs font-bold text-zinc-400 mt-2 bg-zinc-950 px-2">Gateway (GWM)</span>
              {/* Lines from Gateway to Buses */}
              <svg className="absolute top-12 w-full h-20 overflow-visible z-0" style={{ width: '60vw', left: '-30vw' }}>
                <path d="M 30vw 0 L 30vw 20 L 0 20 L 0 40" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="4" />
                <path d="M 30vw 0 L 30vw 20 L 60vw 20 L 60vw 40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="4" />
              </svg>
            </div>

            {/* Modules */}
            {modules.map(mod => (
              <div 
                key={mod.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                style={{ left: `${mod.x}%`, top: `${mod.y}%` }}
              >
                <div className={`w-20 h-16 rounded-xl border-2 flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10 bg-zinc-900 ${
                  mod.status === 'offline' ? 'border-zinc-700 opacity-50' :
                  mod.dtcCount > 0 ? 'border-amber-500' : 'border-emerald-500'
                }`}>
                  <span className="text-sm font-bold text-zinc-200">{mod.id}</span>
                  {mod.status === 'offline' ? (
                    <span className="text-[10px] text-zinc-500 uppercase mt-1">Offline</span>
                  ) : mod.dtcCount > 0 ? (
                    <span className="text-[10px] text-amber-500 font-bold mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> {mod.dtcCount} DTCs
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-500 mt-1 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> OK
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400 mt-2 text-center w-24 bg-zinc-950/80 px-1 rounded">{mod.name}</span>
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg backdrop-blur-sm">
              <h4 className="text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wider">Bus Legend</h4>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500/50 mr-2"></div> HS-CAN (High Speed)</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500/50 mr-2"></div> MS-CAN (Medium Speed)</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500/50 mr-2"></div> LIN (Local Interconnect)</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
