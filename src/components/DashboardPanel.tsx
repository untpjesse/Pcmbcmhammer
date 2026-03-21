import React, { useState, useEffect } from 'react';
import { Gauge, Zap, Thermometer, Activity, Power, Network, Cpu, Hash, AlertCircle, Settings } from 'lucide-react';
import { DeviceInfo } from '../types';

interface DashboardPanelProps {
  isConnected: boolean;
  deviceInfo: DeviceInfo | null;
  j2534DeviceId?: number | null;
  j2534ChannelId?: number | null;
  onOpenSettings: () => void;
  onOpenProxyGuide: () => void;
  onAutoSetupProxy: () => void;
}

const CircularGauge = ({ 
  value, 
  min = 0, 
  max, 
  label, 
  unit, 
  colorClass, 
  icon: Icon 
}: { 
  value: number, 
  min?: number, 
  max: number, 
  label: string, 
  unit: string, 
  colorClass: string,
  icon: any
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="hardware-card p-6 flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 group-hover:bg-vcx-blue transition-colors" />
      <div className="absolute top-4 left-4 text-slate-500 group-hover:text-vcx-blue transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90 absolute">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-800/50"
          />
          {/* Foreground circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-700 ease-out ${colorClass}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="flex flex-col items-center justify-center z-10">
          <span className="text-3xl font-bold text-white tracking-tighter font-mono">
            {Math.round(value)}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit}</span>
        </div>
      </div>
      <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        {label}
      </div>
    </div>
  );
};

export function DashboardPanel({ 
  isConnected, 
  deviceInfo, 
  j2534DeviceId, 
  j2534ChannelId,
  onOpenSettings,
  onOpenProxyGuide,
  onAutoSetupProxy
}: DashboardPanelProps) {
  const [rpm, setRpm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [temp, setTemp] = useState(0);
  const [voltage, setVoltage] = useState(0);

  useEffect(() => {
    // In a real implementation, this would poll the ECU via J2534 or Serial
    setRpm(0);
    setSpeed(0);
    setTemp(0);
    setVoltage(0);
  }, [isConnected]);

  return (
    <div className="h-full flex flex-col space-y-6">
      {!isConnected && (
        <div className="hardware-card p-6 bg-gradient-to-r from-vcx-blue/20 to-transparent border-l-4 border-l-vcx-blue animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-vcx-blue/20 flex items-center justify-center shrink-0 border border-vcx-blue/30">
              <Zap className="w-6 h-6 text-vcx-blue animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1">Getting Started</h3>
              <p className="text-sm text-slate-400 mb-4 max-w-2xl">
                Welcome to the VCX Nano Professional Suite. To begin diagnostics or programming, you must first establish a link with your hardware interface.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={onAutoSetupProxy}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded border border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex items-center group"
                >
                  <Zap className="w-3.5 h-3.5 mr-2 text-emerald-300 group-hover:scale-125 transition-transform" />
                  One-Click Proxy Setup
                </button>
                <button 
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center"
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Configure Interface
                </button>
                <button 
                  onClick={onOpenProxyGuide}
                  className="px-4 py-2 bg-vcx-blue/20 hover:bg-vcx-blue/30 text-vcx-blue text-[10px] font-bold uppercase tracking-widest rounded border border-vcx-blue/30 transition-all flex items-center"
                >
                  <Network className="w-3.5 h-3.5 mr-2" />
                  Setup J2534 Proxy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hardware-card p-4 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-vcx-blue/10 flex items-center justify-center border border-vcx-blue/20">
            <Gauge className="w-6 h-6 text-vcx-blue" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Live Telemetry</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Real-time ECU Data Stream</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isConnected && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Interface Offline</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CircularGauge 
            value={rpm} 
            max={8000} 
            label="Engine Speed" 
            unit="RPM" 
            colorClass="text-blue-500"
            icon={Activity}
          />
          <CircularGauge 
            value={speed} 
            max={160} 
            label="Vehicle Speed" 
            unit="MPH" 
            colorClass="text-emerald-500"
            icon={Gauge}
          />
          <CircularGauge 
            value={temp} 
            min={0}
            max={120} 
            label="Coolant Temp" 
            unit="°C" 
            colorClass="text-rose-500"
            icon={Thermometer}
          />
          <CircularGauge 
            value={voltage} 
            min={9}
            max={16} 
            label="System Voltage" 
            unit="Volts" 
            colorClass="text-amber-500"
            icon={Zap}
          />
        </div>

        {/* Digital Readouts */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
            <Activity className="w-3 h-3 mr-2 text-blue-400" />
            Extended Parameters
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Throttle Position', value: 0, unit: '%' },
              { label: 'Engine Load', value: 0, unit: '%' },
              { label: 'Intake Air Temp', value: 0, unit: '°C' },
              { label: 'Mass Air Flow', value: 0, unit: 'g/s' },
            ].map((stat, i) => (
              <div key={i} className="hardware-card p-4 bg-slate-900/30 flex flex-col group hover:border-slate-500 transition-colors">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 group-hover:text-slate-400">{stat.label}</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-slate-200 font-mono">{stat.value}</span>
                  <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* J2534 Proxy Connection Details */}
        {isConnected && deviceInfo?.protocol.includes('Proxy') && (
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
              <Network className="w-3 h-3 mr-2 text-blue-400" />
              J2534 Interface Session
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="hardware-card p-4 bg-blue-900/5 flex items-center border-blue-900/20">
                <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center mr-4 border border-blue-500/20">
                  <Cpu className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Device Name</p>
                  <p className="text-xs text-slate-200 font-mono font-bold truncate max-w-[150px]">{deviceInfo.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="hardware-card p-4 bg-blue-900/5 flex items-center border-blue-900/20">
                <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center mr-4 border border-blue-500/20">
                  <Hash className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Device ID</p>
                  <p className="text-xs text-slate-200 font-mono font-bold">{j2534DeviceId ?? 'N/A'}</p>
                </div>
              </div>
              <div className="hardware-card p-4 bg-blue-900/5 flex items-center border-blue-900/20">
                <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center mr-4 border border-blue-500/20">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active Channel</p>
                  <p className="text-xs text-slate-200 font-mono font-bold">{j2534ChannelId ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
