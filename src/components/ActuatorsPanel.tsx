import React, { useState } from 'react';
import { Power, Fan, Zap, Volume2, Wind, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react';

interface ActuatorsPanelProps {
  isConnected: boolean;
}

interface Actuator {
  id: string;
  name: string;
  icon: any;
  state: boolean;
  isProcessing?: boolean;
}

export function ActuatorsPanel({ isConnected }: ActuatorsPanelProps) {
  const [actuators, setActuators] = useState<Actuator[]>([
    { id: 'fan1', name: 'Radiator Fan (Low)', icon: Fan, state: false },
    { id: 'fan2', name: 'Radiator Fan (High)', icon: Fan, state: false },
    { id: 'fuel', name: 'Fuel Pump Relay', icon: Zap, state: false },
    { id: 'horn', name: 'Horn Relay', icon: Volume2, state: false },
    { id: 'ac', name: 'A/C Compressor Clutch', icon: Wind, state: false },
    { id: 'mil', name: 'Malfunction Indicator Lamp', icon: Lightbulb, state: false },
  ]);

  const toggleActuator = (id: string) => {
    if (!isConnected) return;
    
    // Set processing state
    setActuators(prev => prev.map(a => a.id === id ? { ...a, isProcessing: true } : a));
    
    // Simulate network delay and command execution
    setTimeout(() => {
      setActuators(prev => prev.map(a => a.id === id ? { ...a, state: !a.state, isProcessing: false } : a));
    }, 800 + Math.random() * 1000);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Power className="w-5 h-5 mr-2 text-rose-500" />
          Bi-Directional Controls (Actuators)
        </h2>
      </div>

      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/70">
          <strong className="text-amber-500 font-semibold">Caution:</strong> Activating components manually can cause physical movement, engine stalling, or battery drain. Ensure the vehicle is in a safe state (Park/Neutral, Engine Off for most tests).
        </p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actuators.map((actuator) => {
            const Icon = actuator.icon;
            return (
              <div key={actuator.id} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 flex flex-col items-center text-center transition-colors hover:border-zinc-700 relative">
                <div className={`p-4 rounded-full mb-4 transition-colors ${
                  actuator.state 
                    ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200 mb-4">{actuator.name}</h3>
                <button
                  onClick={() => toggleActuator(actuator.id)}
                  disabled={!isConnected || actuator.isProcessing}
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                    !isConnected || actuator.isProcessing ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' :
                    actuator.state 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {actuator.isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    actuator.state ? 'Turn OFF' : 'Turn ON'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
