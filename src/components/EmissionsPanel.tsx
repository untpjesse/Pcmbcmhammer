import React, { useState, useEffect } from 'react';
import { Leaf, Check, X, Minus, RefreshCw } from 'lucide-react';

interface EmissionsPanelProps {
  isConnected: boolean;
}

interface Monitor {
  id: string;
  name: string;
  status: 'complete' | 'incomplete' | 'na';
}

export function EmissionsPanel({ isConnected }: EmissionsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [monitors, setMonitors] = useState<Monitor[]>([
    { id: 'mis', name: 'Misfire Monitor', status: 'na' },
    { id: 'fuel', name: 'Fuel System Monitor', status: 'na' },
    { id: 'comp', name: 'Comprehensive Component Monitor', status: 'na' },
    { id: 'cat', name: 'Catalyst Monitor', status: 'na' },
    { id: 'htcat', name: 'Heated Catalyst Monitor', status: 'na' },
    { id: 'evap', name: 'Evaporative System Monitor', status: 'na' },
    { id: 'secair', name: 'Secondary Air System Monitor', status: 'na' },
    { id: 'o2', name: 'Oxygen Sensor Monitor', status: 'na' },
    { id: 'o2htr', name: 'Oxygen Sensor Heater Monitor', status: 'na' },
    { id: 'egr', name: 'EGR/VVT System Monitor', status: 'na' },
  ]);

  const refreshMonitors = () => {
    if (!isConnected) return;
    setIsRefreshing(true);
    
    // Simulate reading OBD2 Mode 01 PID 01
    setTimeout(() => {
      setMonitors(prev => prev.map(m => {
        // Randomly assign statuses for simulation
        const rand = Math.random();
        let status: 'complete' | 'incomplete' | 'na' = 'na';
        
        if (['mis', 'fuel', 'comp'].includes(m.id)) {
          status = 'complete'; // Usually complete continuously
        } else {
          if (rand > 0.6) status = 'complete';
          else if (rand > 0.3) status = 'incomplete';
          else status = 'na'; // Not supported by vehicle
        }
        
        return { ...m, status };
      }));
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    if (isConnected) {
      refreshMonitors();
    } else {
      setMonitors(prev => prev.map(m => ({ ...m, status: 'na' })));
    }
  }, [isConnected]);

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-emerald-500" />
          OBD-II Readiness (Emissions)
        </h2>
        <button
          onClick={refreshMonitors}
          disabled={!isConnected || isRefreshing}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center border border-zinc-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-zinc-900/80 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <div className="col-span-8">Monitor Name</div>
              <div className="col-span-4 text-right">Status</div>
            </div>
            
            <div className="divide-y divide-zinc-800/50">
              {monitors.map((monitor) => (
                <div key={monitor.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-800/30 transition-colors">
                  <div className="col-span-8 font-medium text-zinc-300">
                    {monitor.name}
                  </div>
                  <div className="col-span-4 flex justify-end">
                    {monitor.status === 'complete' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5 mr-1.5" /> Complete
                      </span>
                    )}
                    {monitor.status === 'incomplete' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <X className="w-3.5 h-3.5 mr-1.5" /> Incomplete
                      </span>
                    )}
                    {monitor.status === 'na' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
                        <Minus className="w-3.5 h-3.5 mr-1.5" /> N/A
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-sm text-zinc-500 text-center">
            <p>Readiness monitors indicate whether the vehicle's emissions systems have completed their self-tests.</p>
            <p className="mt-1">Most jurisdictions require all supported monitors to be "Complete" to pass an emissions inspection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
