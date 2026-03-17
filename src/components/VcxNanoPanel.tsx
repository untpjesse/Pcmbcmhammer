import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, RefreshCw, AlertCircle, Info, Settings, Activity, Terminal } from 'lucide-react';
import { DeviceInfo } from '../types';

interface VcxNanoPanelProps {
  isConnected: boolean;
  deviceInfo: DeviceInfo | null;
  onAutoSetupProxy: () => void;
}

export default function VcxNanoPanel({ isConnected, deviceInfo, onAutoSetupProxy }: VcxNanoPanelProps) {
  const [firmwareVersion, setFirmwareVersion] = useState<string>('1.8.4.0');
  const [serialNumber, setSerialNumber] = useState<string>('V71XN000000');
  const [licenseStatus, setLicenseStatus] = useState<string>('Valid');
  const [isUpdating, setIsUpdating] = useState(false);

  const isVcxNano = deviceInfo?.name.toLowerCase().includes('vcx nano') || false;

  const handleUpdateFirmware = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setFirmwareVersion('1.8.9.0');
    }, 3000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="hardware-card p-4 bg-blue-900/10 border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Cpu className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">VCX Nano Optimizer</h2>
            <p className="text-[10px] text-blue-400/60 font-medium uppercase tracking-wider">Hardware-Specific Control Suite</p>
          </div>
        </div>
        {isVcxNano && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Genuine Hardware Verified</span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="hardware-card p-8 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/30">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <Activity className="w-8 h-8 text-slate-500" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Hardware Link Required</h3>
            <p className="text-sm text-slate-400 mb-6">
              Connect your VCX Nano via USB and ensure VX Manager is running. Use the intelligent setup to establish the bridge.
            </p>
            <button
              onClick={onAutoSetupProxy}
              className="px-6 py-3 bg-vcx-blue hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-lg border border-blue-400/30 shadow-lg shadow-blue-500/20 transition-all flex items-center mx-auto group"
            >
              <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Initialize VCX Link
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hardware Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="hardware-card p-5 bg-slate-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Firmware Version</span>
                  <span className="text-xs font-mono text-blue-400 font-bold">{firmwareVersion}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%]" />
                </div>
                <button 
                  onClick={handleUpdateFirmware}
                  disabled={isUpdating}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-slate-300 uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center"
                >
                  {isUpdating ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                  Check for Updates
                </button>
              </div>

              <div className="hardware-card p-5 bg-slate-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">License Status</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{licenseStatus}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Expires: 2028-12-31</span>
                </div>
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-slate-300 uppercase tracking-widest rounded border border-slate-700 transition-all flex items-center justify-center">
                  <Settings className="w-3 h-3 mr-2" />
                  Renew License
                </button>
              </div>
            </div>

            <div className="hardware-card p-6 bg-slate-900/30">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                <Terminal className="w-3 h-3 mr-2 text-blue-400" />
                Hardware Self-Test
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'USB Communication', status: 'OK', color: 'text-emerald-400' },
                  { label: 'J2534 DLL Binding', status: 'OK', color: 'text-emerald-400' },
                  { label: 'Voltage (Pin 16)', status: '13.8V', color: 'text-blue-400' },
                  { label: 'CAN Bus Transceiver', status: 'Active', color: 'text-emerald-400' },
                ].map((test, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-2 last:border-0">
                    <span className="text-[11px] text-slate-400">{test.label}</span>
                    <span className={`text-[11px] font-bold font-mono ${test.color}`}>{test.status}</span>
                  </div>
                ))}
                <button className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-500/30 transition-all">
                  Run Full Diagnostic Suite
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="hardware-card p-5 bg-amber-900/5 border-amber-900/20">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">VCX Nano Tips</h4>
              </div>
              <ul className="space-y-3">
                <li className="text-[10px] text-slate-400 leading-relaxed">
                  • Always use <span className="text-slate-200">VX Manager</span> to update licenses before using OEM software.
                </li>
                <li className="text-[10px] text-slate-400 leading-relaxed">
                  • For GM vehicles, ensure the <span className="text-slate-200">GDS2</span> driver is installed in VX Manager.
                </li>
                <li className="text-[10px] text-slate-400 leading-relaxed">
                  • If connection fails, try unplugging and re-plugging the USB cable to reset the internal MCU.
                </li>
              </ul>
            </div>

            <div className="hardware-card p-5 bg-slate-900/30">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-4 h-4 text-blue-400" />
                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Device Details</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Serial</span>
                  <span className="text-[10px] text-slate-300 font-mono">{serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Hardware</span>
                  <span className="text-[10px] text-slate-300 font-mono">V1.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">Region</span>
                  <span className="text-[10px] text-slate-300 font-mono">Global</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
