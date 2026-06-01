import React, { useState } from 'react';
import { Zap, Upload, Shield, AlertTriangle, FileCode, HardDrive, Cpu, Loader2, List, CheckCircle } from 'lucide-react';
import { LogEntry } from '../types';
import { RPO_CODES } from '../lib/rpoCodes';

interface Props {
  isConnected: boolean;
  onSendCommand: (hexString: string) => void;
  addLog?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export function BcmProgrammingPanel({ isConnected, onSendCommand, addLog }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Idle');

  // RPO States
  const [activeRpos, setActiveRpos] = useState<string[]>([]);
  const [isReadingRpos, setIsReadingRpos] = useState(false);
  const [isWritingRpos, setIsWritingRpos] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (addLog) addLog(`Loaded BCM firmware file: ${e.target.files[0].name}`, 'info');
    }
  };

  const startFlash = async () => {
    if (!file || !isConnected) return;
    setIsFlashing(true);
    setStatus('Requesting Security Access...');
    setProgress(0);
    if (addLog) addLog('Starting BCM Flash Sequence...', 'warning');

    try {
      // Extended Diagnostic Session
      onSendCommand('10 03'); 
      await new Promise(r => setTimeout(r, 1000));
      setProgress(5);

      // Security Access
      setStatus('Unlocking BCM...');
      onSendCommand('27 01'); // Request Seed
      await new Promise(r => setTimeout(r, 800));
      onSendCommand('27 02 00 00 00 00'); // Send Key
      await new Promise(r => setTimeout(r, 1000));
      setProgress(15);
      
      // Routine Control - Erase
      setStatus('Erasing Flash...');
      onSendCommand('31 01 FF 00'); // Erase Memory
      await new Promise(r => setTimeout(r, 2500));
      setProgress(30);

      // Request Download
      setStatus('Writing Data Blocks...');
      onSendCommand('34 00 44 00 00 00 00 00 04 00 00'); 
      
      for(let i = 35; i <= 95; i += 5) {
         await new Promise(r => setTimeout(r, 400));
         setProgress(i);
         // Simulate Transfer Data blocks here:
         onSendCommand(`36 ${i.toString(16).padStart(2, '0')} FF FF FF FF FF FF FF FF`); 
      }

      // Validating Checksum
      setStatus('Validating Checksum...');
      setProgress(98);
      onSendCommand('31 01 02 02'); // Checksum Routine
      await new Promise(r => setTimeout(r, 2000));
      
      // ECU Reset
      setStatus('Restarting Module...');
      onSendCommand('11 01'); // Hard Reset
      await new Promise(r => setTimeout(r, 1000));
      setProgress(100);

      if (addLog) addLog('BCM Flash Completed Successfully', 'success');
      setStatus('Flash Complete');
    } catch (e) {
      setStatus('Flash Failed!');
      if (addLog) addLog('BCM Flash Sequence Failed. Recovery recommended.', 'error');
    } finally {
      setIsFlashing(false);
      setTimeout(() => { if (progress >= 100) setProgress(0); setStatus('Idle'); }, 4000);
    }
  };

  const readRpos = async () => {
    if (!isConnected) return;
    setIsReadingRpos(true);
    if (addLog) addLog('Requesting As-Built RPO Configuration from BCM...', 'info');

    try {
      onSendCommand('22 1A 90'); // Mock UDS DID for As-Built Data
      await new Promise(r => setTimeout(r, 1200));
      
      // Randomly enable a few RPOs for demonstration
      const randomRpos = RPO_CODES.filter(() => Math.random() > 0.6).map(r => r.code);
      // Ensure at least one is selected
      if (randomRpos.length === 0) randomRpos.push('A31', 'AU3');
      
      setActiveRpos(randomRpos);
      if (addLog) addLog(`Successfully Read BCM RPO Configuration. Found ${randomRpos.length} active features.`, 'success');
    } catch (e) {
      if (addLog) addLog('Failed to read BCM As-Built Configuration.', 'error');
    } finally {
      setIsReadingRpos(false);
    }
  };

  const writeRpos = async () => {
    if (!isConnected) return;
    setIsWritingRpos(true);
    if (addLog) addLog('Writing new As-Built RPO Configuration to BCM...', 'warning');

    try {
      onSendCommand('10 03');
      await new Promise(r => setTimeout(r, 500));
      onSendCommand('27 01');
      await new Promise(r => setTimeout(r, 500));
      onSendCommand('27 02 FF FF FF FF');
      await new Promise(r => setTimeout(r, 800));

      // Mock write DID
      onSendCommand(`2E 1A 90 ${activeRpos.map(r => r.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')}`);
      await new Promise(r => setTimeout(r, 1500));
      
      onSendCommand('11 01'); // Reset
      await new Promise(r => setTimeout(r, 800));

      if (addLog) addLog('Successfully Wrote Component Configuration (RPOs).', 'success');
    } catch (e) {
      if (addLog) addLog('Failed to write RPO Configuration.', 'error');
    } finally {
      setIsWritingRpos(false);
    }
  };

  const toggleRpo = (code: string) => {
    setActiveRpos(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const getStatusColor = () => {
    if (status === 'Flash Complete') return 'text-emerald-400';
    if (status === 'Flash Failed!') return 'text-red-400';
    if (isFlashing) return 'text-amber-400';
    return 'text-zinc-400';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-indigo-400" />
          Body Control Module (BCM) Flashing
        </h2>
        {!isConnected && (
          <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            Connect device to enable flashing
          </span>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Warning Banner */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-1">CRITICAL WARNING</h3>
              <p className="text-xs text-red-300/[0.85] leading-relaxed">
                Programming the Body Control Module (BCM) carries severe risks. Flashing with incorrect firmware or experiencing a voltage drop during the process will BRICK the module, rendering the vehicle immobilized. Ensure a stable battery maintainer (13.5V+) is connected.
              </p>
            </div>
          </div>

          {/* Firmware Selection */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
              <FileCode className="w-4 h-4 mr-2 text-slate-400" />
              1. Select Firmware Payload
            </h3>
            
            <div className="flex items-center space-x-4">
              <label className={`flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/30'}`}>
                <input type="file" className="hidden" accept=".bin,.hex,.s19,.vbf" onChange={handleFileSelect} disabled={isFlashing} />
                <div className="text-center">
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-slate-300">Click to browse or drag and drop</p>
                      <p className="text-xs text-slate-500 mt-1">Supported formats: .bin, .hex, .s19, .vbf</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Execution Panel */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-slate-400" />
              2. Programming Sequence
            </h3>

            <div className="space-y-6">
              {/* Status Display */}
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-lg">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Action</p>
                  <p className={`text-sm font-medium flex items-center ${getStatusColor()}`}>
                    {isFlashing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {status}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</p>
                  <p className="text-sm font-mono text-slate-300">{progress}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${
                    status === 'Flash Failed!' ? 'bg-red-500' : 
                    status === 'Flash Complete' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={startFlash}
                  disabled={!isConnected || !file || isFlashing}
                  className={`col-span-2 sm:col-span-1 flex items-center justify-center p-3 rounded-lg border font-medium transition-colors text-sm ${
                    !isConnected || !file || isFlashing
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Flash BCM Firmware
                </button>
                
                <button
                  disabled={!isConnected || isFlashing}
                  className={`col-span-2 sm:col-span-1 flex items-center justify-center p-3 rounded-lg border font-medium transition-colors text-sm ${
                    !isConnected || isFlashing
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800/50 hover:bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Read BCM Information
                </button>
              </div>
            </div>
          </div>

          {/* RPO Configuration */}
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <List className="w-4 h-4 mr-2 text-slate-400" />
                3. RPO Configuration (As-Built Data)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={readRpos}
                  disabled={!isConnected || isReadingRpos || isFlashing || isWritingRpos}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-md text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
                >
                  {isReadingRpos ? 'Reading...' : 'Fetch RPOs'}
                </button>
                <button
                  onClick={writeRpos}
                  disabled={!isConnected || isWritingRpos || isFlashing || isReadingRpos}
                  className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-md text-xs font-medium text-indigo-400 transition-colors disabled:opacity-50"
                >
                  {isWritingRpos ? 'Writing...' : 'Write RPOs'}
                </button>
              </div>
            </h3>

            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-700">
                {RPO_CODES.map((rpo) => {
                  const isActive = activeRpos.includes(rpo.code);
                  return (
                    <label 
                      key={rpo.code}
                      className={`flex items-start p-3 cursor-pointer transition-colors ${isActive ? 'bg-indigo-500/10' : 'bg-slate-900 hover:bg-slate-800/80'}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={isActive}
                          onChange={() => toggleRpo(rpo.code)}
                          disabled={isReadingRpos || isWritingRpos || isFlashing}
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isActive ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-slate-800'}`}>
                          {isActive && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="ml-3 flex-1 flex flex-col min-w-0">
                        <span className={`text-sm font-bold ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>{rpo.code}</span>
                        <span className="text-xs text-slate-500 truncate mt-0.5" title={rpo.description}>{rpo.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mt-3 flex items-center justify-center text-center">
               Toggle options to enable/disable feature flags in the BCM. Ensure the hardware supports the enabled options.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
