import { useState, useEffect } from 'react';
import { DTC } from '../types';
import { AlertTriangle, Trash2, CheckCircle, Download } from 'lucide-react';

interface DTCPanelProps {
  isConnected: boolean;
}

export default function DTCPanel({ isConnected }: DTCPanelProps) {
  const [dtcs, setDtcs] = useState<DTC[]>([
    { code: 'P0101', description: 'Mass or Volume Air Flow Circuit Range/Performance', status: 'Current' },
    { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', status: 'History' },
    { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold (Bank 1)', status: 'Pending' },
  ]);

  const handleClear = () => {
    if (!isConnected) return;
    setDtcs([]);
  };

  const handleSaveReport = () => {
    if (dtcs.length === 0) return;

    const timestamp = new Date().toLocaleString();
    let report = `Diagnostic Trouble Code Report\nGenerated: ${timestamp}\n\n`;
    
    dtcs.forEach(dtc => {
      report += `[${dtc.code}] ${dtc.description}\nStatus: ${dtc.status}\n----------------------------------------\n`;
    });

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dtc_report_${new Date().toISOString()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium mb-2">DTCs Unavailable</h3>
        <p className="text-zinc-500 text-sm">Connect to a device to read diagnostic trouble codes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-zinc-200 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          Diagnostic Trouble Codes
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleSaveReport}
            disabled={dtcs.length === 0}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-md flex items-center transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Save Report
          </button>
          <button 
            onClick={handleClear}
            className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 rounded-md flex items-center transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Codes
          </button>
        </div>
      </div>

      {dtcs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 bg-zinc-900/20 border border-zinc-800 rounded-lg">
          <CheckCircle className="w-16 h-16 text-emerald-500/20 mb-4" />
          <p className="text-zinc-400 font-medium">No DTCs Found</p>
          <p className="text-zinc-600 text-sm">System is operating normally.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1">
          {dtcs.map((dtc) => (
            <div key={dtc.code} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start justify-between hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-lg font-mono font-bold text-amber-500">{dtc.code}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                    dtc.status === 'Current' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    dtc.status === 'History' ? 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/50' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {dtc.status}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm">{dtc.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
