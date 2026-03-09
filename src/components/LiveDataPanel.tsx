import { useState, useEffect } from 'react';
import { PID } from '../types';
import { Activity, Gauge, Thermometer, Wind, Zap } from 'lucide-react';

interface LiveDataPanelProps {
  isConnected: boolean;
}

export default function LiveDataPanel({ isConnected }: LiveDataPanelProps) {
  const [pids, setPids] = useState<PID[]>([
    { id: 'rpm', name: 'Engine Speed', value: 0, unit: 'RPM', min: 0, max: 8000 },
    { id: 'speed', name: 'Vehicle Speed', value: 0, unit: 'MPH', min: 0, max: 160 },
    { id: 'ect', name: 'Coolant Temp', value: 0, unit: '°F', min: -40, max: 260 },
    { id: 'iat', name: 'Intake Air Temp', value: 0, unit: '°F', min: -40, max: 260 },
    { id: 'map', name: 'Manifold Pressure', value: 0, unit: 'kPa', min: 0, max: 105 },
    { id: 'maf', name: 'Mass Air Flow', value: 0, unit: 'g/s', min: 0, max: 512 },
    { id: 'tps', name: 'Throttle Position', value: 0, unit: '%', min: 0, max: 100 },
    { id: 'spark', name: 'Spark Advance', value: 0, unit: '°', min: -10, max: 60 },
    { id: 'kr', name: 'Knock Retard', value: 0, unit: '°', min: 0, max: 15 },
    { id: 'lterm', name: 'Long Term Fuel Trim', value: 0, unit: '%', min: -25, max: 25 },
    { id: 'sterm', name: 'Short Term Fuel Trim', value: 0, unit: '%', min: -25, max: 25 },
    { id: 'batt', name: 'Battery Voltage', value: 0, unit: 'V', min: 0, max: 16 },
  ]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setPids(prev => prev.map(pid => {
        let newValue = pid.value;
        const noise = (Math.random() - 0.5) * 2; // Random fluctuation

        switch (pid.id) {
          case 'rpm':
            newValue = Math.max(600, Math.min(8000, pid.value + (Math.random() - 0.5) * 100));
            // Simulate idle hunting or revving
            if (Math.random() > 0.95) newValue += 500; 
            break;
          case 'speed':
            // Slowly accelerate/decelerate
            newValue = Math.max(0, Math.min(160, pid.value + (Math.random() - 0.5) * 5));
            break;
          case 'ect':
            // Slowly warm up to 195
            if (pid.value < 195) newValue += 0.5;
            else newValue += (Math.random() - 0.5);
            break;
          case 'iat':
             newValue = 85 + (Math.random() - 0.5) * 2;
             break;
          case 'map':
             // Inverse to throttle roughly
             newValue = 35 + (Math.random() * 10);
             break;
          case 'tps':
             // Random throttle blips
             if (Math.random() > 0.9) newValue = Math.random() * 100;
             else newValue = Math.max(0, pid.value - 5);
             break;
          case 'batt':
             newValue = 13.8 + (Math.random() - 0.5) * 0.2;
             break;
          default:
             newValue += noise;
        }

        return { ...pid, value: Number(newValue.toFixed(1)) };
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
        <Activity className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-zinc-400 font-medium mb-2">Live Data Unavailable</h3>
        <p className="text-zinc-500 text-sm">Connect to a device to view live parameters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-full bg-black">
      {pids.map(pid => (
        <div key={pid.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">{pid.name}</span>
            {pid.id === 'rpm' && <Gauge className="w-4 h-4 text-zinc-600" />}
            {pid.id === 'ect' && <Thermometer className="w-4 h-4 text-zinc-600" />}
            {pid.id === 'maf' && <Wind className="w-4 h-4 text-zinc-600" />}
            {pid.id === 'batt' && <Zap className="w-4 h-4 text-zinc-600" />}
          </div>
          
          <div className="flex items-baseline space-x-1 relative z-10">
            <span className={`text-2xl font-mono font-bold ${
                pid.id === 'rpm' && pid.value > 6000 ? 'text-red-500' :
                pid.id === 'ect' && pid.value > 230 ? 'text-red-500' :
                'text-zinc-100'
            }`}>
              {pid.value}
            </span>
            <span className="text-xs text-zinc-500">{pid.unit}</span>
          </div>

          {/* Simple bar graph background */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
            <div 
                className={`h-full transition-all duration-300 ${
                    pid.id === 'rpm' && pid.value > 6000 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, ((pid.value - pid.min) / (pid.max - pid.min)) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
