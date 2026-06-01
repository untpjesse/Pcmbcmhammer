import React, { useState } from 'react';
import { Cpu, Settings2, Download, Upload, Zap, AlertCircle, Database } from 'lucide-react';
import { LogEntry } from '../types';

interface Props {
  isConnected: boolean;
  onSendCommand: (hexString: string) => void;
  addLog?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export function DelphiToolsPanel({ isConnected, onSendCommand, addLog }: Props) {
  const [selectedModule, setSelectedModule] = useState('P01');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Idle');

  const DELPHI_MODULES = [
    { id: 'P01', name: 'Delphi LS1 Gen 3 (P01)', protocol: 'VPW J1850' },
    { id: 'P59', name: 'Delphi LS2 Gen 3 (P59)', protocol: 'VPW J1850' },
    { id: 'E38', name: 'Delphi Gen 4 (E38)', protocol: 'CAN' },
    { id: 'E67', name: 'Delphi Gen 4 (E67)', protocol: 'CAN' },
    { id: 'MT80', name: 'Delphi MT80', protocol: 'CAN' }
  ];

  const handleAction = async (actionName: string, commands: string[], requiresFlash: boolean = false) => {
    if (!isConnected) return;
    setIsProcessing(true);
    setStatus(`${actionName}...`);
    setProgress(0);

    if (addLog) addLog(`Starting Delphi Action: ${actionName} on ${selectedModule}`, 'info');

    try {
      const stepValue = 100 / commands.length;
      
      for (let i = 0; i < commands.length; i++) {
        // Send command
        onSendCommand(commands[i]);
        
        // Dynamic wait based on action type
        const delay = commands[i].startsWith('36') ? 100 : (commands[i].startsWith('34') || commands[i].startsWith('31')) ? 1500 : 500;
        await new Promise(r => setTimeout(r, delay));
        
        setProgress(Math.min(100, Math.round((i + 1) * stepValue)));
      }

      // If it's a flash action, simulate the heavy data transfer
      if (requiresFlash) {
        setStatus('Transferring Data Blocks...');
        for(let j = 1; j <= 50; j++) {
            await new Promise(r => setTimeout(r, 60));
            setProgress(Math.min(100, 10 + Math.round((j / 50) * 85)));
            // Mock transfer frames
            if (j % 10 === 0) onSendCommand(`36 ${j.toString(16).padStart(2, '0')} AA BB CC DD EE FF`);
        }
        setProgress(100);
      }

      if (addLog) addLog(`Delphi Action Completed: ${actionName}`, 'success');
      setStatus('Completed');
    } catch (e) {
      if (addLog) addLog(`Delphi Action Failed: ${actionName}`, 'error');
      setStatus('Failed');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        if (progress >= 100) {
          setProgress(0);
          setStatus('Idle');
        }
      }, 3000);
    }
  };

  const readCalibration = () => {
    handleAction('Reading Calibration', [
      '10 03', // Extended diagnostic session
      '27 01', // Request Seed
      '27 02 00 00 00 00', // Send Key (Mock)
      '35 00 00 00 00 10 00 00' // Request Upload
    ], true);
  };

  const writeCalibration = () => {
    handleAction('Writing Calibration', [
      '10 03', // Extended
      '28 00 01', // Disable comms
      '85 02', // DTCs off
      '27 01', // Seed request 
      '27 02 00 00 00 00', // Key
      '31 01 FF 00', // Erase Routine
      '34 00 00 00 00 00 10 00 00' // Request Download
    ], true);
  };

  const identifyModule = () => {
    handleAction('Identifying Delphi OS/Hardware', [
      '1A 90', // Read VIN
      '1A 9C', // Read OS
      '22 F1 90', // UDS Read VIN
      '22 F1 8C'  // UDS Read Serial Number
    ]);
  };

  const vatsDelete = () => {
    handleAction('Disabling VATS/Immo (Patch)', [
      '10 03',
      '27 01',
      '27 02 FF FF FF FF',
      '3D 00 00 00 04', // Write Memory By Address (Mock patch addressing)
      '11 01' // Reset
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center">
          <Settings2 className="w-5 h-5 mr-2 text-blue-400" />
          Delphi Module Suite
        </h2>
        {!isConnected && (
          <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            Hardware disconnected
          </span>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
            <Cpu className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-1">Delphi ECM/PCM Interfacing</h3>
              <p className="text-xs text-blue-300/[0.85] leading-relaxed">
                Connect directly to GM/Delphi engine control units over CAN or J1850 VPW. Ensure you have the correct battery voltage (recommended 13+ Volts) before attempting any write or VATS patches.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Module Selection */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
                <Database className="w-4 h-4 mr-2 text-slate-400" />
                Target Controller
              </h3>
              
              <div className="space-y-3">
                {DELPHI_MODULES.map(mod => (
                  <label 
                    key={mod.id} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedModule === mod.id 
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="delphiModule" 
                      value={mod.id}
                      checked={selectedModule === mod.id}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="hidden"
                      disabled={isProcessing}
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-semibold text-sm">{mod.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 bg-slate-950 px-2 py-1 rounded-md">{mod.protocol}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Operations */}
            <div className="space-y-6">
              
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-slate-400" />
                  Operations
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={identifyModule}
                    disabled={!isConnected || isProcessing}
                    className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400 transition-colors">Identify Module</span>
                    <Cpu className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </button>

                  <button
                    onClick={readCalibration}
                    disabled={!isConnected || isProcessing}
                    className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-sm font-medium text-slate-300 group-hover:text-indigo-400 transition-colors">Read Calibration</span>
                    <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </button>

                  <button
                    onClick={writeCalibration}
                    disabled={!isConnected || isProcessing}
                    className="w-full flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">Write Calibration</span>
                    <Upload className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
                  Special Functions
                </h3>
                  
                <button
                  onClick={vatsDelete}
                  disabled={!isConnected || isProcessing}
                  className="w-full flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-red-400"
                >
                  <span className="text-sm font-medium">VATS/Immo Disable Patch</span>
                  <Zap className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Progress Banner */}
          {isProcessing && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500/10 transition-all duration-300 pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              <div className="relative flex justify-between items-center">
                <span className="text-blue-400 font-medium text-sm animate-pulse">{status}</span>
                <span className="text-blue-300 font-mono text-sm">{progress}%</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
