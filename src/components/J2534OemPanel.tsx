import React, { useState } from 'react';
import { Network, Laptop, ShieldCheck, Download, CheckCircle2, AlertTriangle, RefreshCw, Car, Wrench, Settings } from 'lucide-react';

interface J2534OemPanelProps {
  isConnected: boolean;
}

type OemSuite = 'gm_sps2' | 'ford_fdrs' | 'toyota_techstream' | 'honda_hds';

export function J2534OemPanel({ isConnected }: J2534OemPanelProps) {
  const [selectedSuite, setSelectedSuite] = useState<OemSuite>('gm_sps2');
  const [actionState, setActionState] = useState<'idle' | 'scanning' | 'programming' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleAction = (actionName: string) => {
    if (!isConnected) return;
    addLog(`Error: ${actionName} requires official OEM backend integration.`);
    addLog('This feature is currently a UI placeholder.');
  };

  const renderGmSps2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2 flex items-center">
          <Laptop className="w-5 h-5 mr-2" />
          GM Service Programming System (SPS2)
        </h3>
        <p className="text-sm text-blue-200/70">
          Simulates the official General Motors SPS2 cloud-based programming environment via J2534.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('Module Programming (PCM)')}
          disabled={!isConnected}
          className="bg-zinc-900 border border-zinc-700 hover:border-blue-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <Download className="w-6 h-6 text-blue-400 mb-2" />
          <h4 className="font-medium text-zinc-200">Replace and Program</h4>
          <p className="text-xs text-zinc-500 mt-1">Flash a new or blank module with the latest calibration.</p>
        </button>

        <button
          onClick={() => handleAction('Calibration Update (TCM)')}
          disabled={!isConnected}
          className="bg-zinc-900 border border-zinc-700 hover:border-blue-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-6 h-6 text-blue-400 mb-2" />
          <h4 className="font-medium text-zinc-200">Reprogram</h4>
          <p className="text-xs text-zinc-500 mt-1">Update an existing module to fix software bugs or TSBs.</p>
        </button>
      </div>
    </div>
  );

  const renderFordFdrs = () => (
    <div className="space-y-6">
      <div className="bg-sky-900/20 border border-sky-500/30 rounded-lg p-4">
        <h3 className="text-sky-400 font-semibold mb-2 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          Ford Diagnostic & Repair System (FDRS)
        </h3>
        <p className="text-sm text-sky-200/70">
          Simulates Ford's modern diagnostic and programming suite for 2018+ vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('Network Scan & DTC Read')}
          disabled={!isConnected}
          className="bg-zinc-900 border border-zinc-700 hover:border-sky-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <Network className="w-6 h-6 text-sky-400 mb-2" />
          <h4 className="font-medium text-zinc-200">Network Test</h4>
          <p className="text-xs text-zinc-500 mt-1">Scan all MS-CAN and HS-CAN modules for faults.</p>
        </button>

        <button
          onClick={() => handleAction('PATS Security Access')}
          disabled={!isConnected}
          className="bg-zinc-900 border border-zinc-700 hover:border-sky-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <ShieldCheck className="w-6 h-6 text-sky-400 mb-2" />
          <h4 className="font-medium text-zinc-200">PATS Functions</h4>
          <p className="text-xs text-zinc-500 mt-1">Program keys and perform parameter resets (requires NASTF).</p>
        </button>
      </div>
    </div>
  );

  const renderToyotaTechstream = () => (
    <div className="space-y-6">
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2 flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          Toyota Techstream
        </h3>
        <p className="text-sm text-red-200/70">
          Simulates Toyota/Lexus factory diagnostic software features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAction('Health Check')}
          disabled={!isConnected}
          className="bg-zinc-900 border border-zinc-700 hover:border-red-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
          <h4 className="font-medium text-zinc-200">Health Check</h4>
          <p className="text-xs text-zinc-500 mt-1">Comprehensive scan of all vehicle ECUs.</p>
        </button>

        <button
          onClick={() => handleAction('Customize Setting')}
          disabled={!isConnected}
          className="bg-zinc-900 border border-zinc-700 hover:border-red-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
        >
          <Settings className="w-6 h-6 text-red-400 mb-2" />
          <h4 className="font-medium text-zinc-200">Customize Setting</h4>
          <p className="text-xs text-zinc-500 mt-1">Change dealer-level body control preferences (doors, lights).</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Laptop className="w-5 h-5 mr-2 text-indigo-500" />
          J2534 OEM Features
        </h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for OEM Selection */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-950/30 p-4 space-y-2 overflow-y-auto">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">OEM Suites</h3>
          
          <button
            onClick={() => { setSelectedSuite('gm_sps2'); setActionState('idle'); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedSuite === 'gm_sps2' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            GM SPS2
          </button>
          <button
            onClick={() => { setSelectedSuite('ford_fdrs'); setActionState('idle'); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedSuite === 'ford_fdrs' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Ford FDRS
          </button>
          <button
            onClick={() => { setSelectedSuite('toyota_techstream'); setActionState('idle'); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedSuite === 'toyota_techstream' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Toyota Techstream
          </button>
          <button
            onClick={() => { setSelectedSuite('honda_hds'); setActionState('idle'); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              selectedSuite === 'honda_hds' ? 'bg-zinc-100/20 text-zinc-100 border border-zinc-100/30' : 'text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            Honda HDS
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!isConnected && (
            <div className="bg-amber-900/20 border-b border-amber-500/30 p-3 flex items-center text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Please connect a J2534 interface to use OEM features.
            </div>
          )}

          <div className="flex-1 p-6 overflow-y-auto">
            {selectedSuite === 'gm_sps2' && renderGmSps2()}
            {selectedSuite === 'ford_fdrs' && renderFordFdrs()}
            {selectedSuite === 'toyota_techstream' && renderToyotaTechstream()}
            {selectedSuite === 'honda_hds' && (
              <div className="space-y-6">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-zinc-300 font-semibold mb-2">Honda Diagnostic System (HDS)</h3>
                  <p className="text-sm text-zinc-400">Simulates Honda/Acura factory diagnostic software.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAction('All DTC Check')}
                    disabled={!isConnected}
                    className="bg-zinc-900 border border-zinc-700 hover:border-zinc-500 p-4 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <Network className="w-6 h-6 text-zinc-400 mb-2" />
                    <h4 className="font-medium text-zinc-200">All DTC Check</h4>
                    <p className="text-xs text-zinc-500 mt-1">Read codes from all vehicle systems.</p>
                  </button>
                </div>
              </div>
            )}

            {/* Logs Section */}
            {logs.length > 0 && (
              <div className="mt-8 bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
                <div className="bg-black/50 rounded-lg p-3 h-40 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1 border border-zinc-800">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
