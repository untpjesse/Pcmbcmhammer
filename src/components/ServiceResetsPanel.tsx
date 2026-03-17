import React, { useState } from 'react';
import { Wrench, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface ServiceResetsPanelProps {
  isConnected: boolean;
}

interface ServiceFunction {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

export function ServiceResetsPanel({ isConnected }: ServiceResetsPanelProps) {
  const [services, setServices] = useState<ServiceFunction[]>([
    { id: 'oil', name: 'Oil Life Reset', description: 'Reset the engine oil life monitor after an oil change.', status: 'idle' },
    { id: 'epb', name: 'EPB Service Mode', description: 'Retract Electronic Parking Brake calipers for pad replacement.', status: 'idle' },
    { id: 'sas', name: 'SAS Calibration', description: 'Calibrate Steering Angle Sensor after alignment or suspension work.', status: 'idle' },
    { id: 'dpf', name: 'DPF Regeneration', description: 'Force a static Diesel Particulate Filter regeneration.', status: 'idle' },
    { id: 'tba', name: 'Throttle Body Alignment', description: 'Relearn throttle valve end stops after cleaning or replacement.', status: 'idle' },
    { id: 'bms', name: 'Battery Registration', description: 'Register a new battery with the Battery Management System.', status: 'idle' },
  ]);

  const handleRunService = (id: string) => {
    if (!isConnected) return;
    
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'running' } : s));
    
    setTimeout(() => {
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'success' } : s));
      
      // Reset back to idle after 3 seconds
      setTimeout(() => {
        setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'idle' } : s));
      }, 3000);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-blue-500" />
          Service Resets & Adaptations
        </h2>
      </div>

      <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-200/70">
          Dealer-level service functions. Ensure the vehicle is in the correct state (e.g., Engine OFF, Ignition ON) before running adaptations.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {services.map(service => (
            <div key={service.id} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <h3 className="text-base font-medium text-zinc-200">{service.name}</h3>
                <p className="text-sm text-zinc-500 mt-1 mb-4">{service.description}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleRunService(service.id)}
                  disabled={!isConnected || service.status === 'running' || service.status === 'success'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                    service.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    service.status === 'running' ? 'bg-blue-600/50 text-white cursor-wait' :
                    'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50'
                  }`}
                >
                  {service.status === 'running' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {service.status === 'success' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {service.status === 'idle' && 'Run Service'}
                  {service.status === 'running' && 'Executing...'}
                  {service.status === 'success' && 'Completed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
