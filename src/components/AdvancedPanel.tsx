import React, { useState } from 'react';
import { Key, RefreshCw, Shield, Cpu, Zap, Edit3, WifiOff, Wifi, ShieldAlert, ShieldCheck, PlayCircle, StopCircle, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

interface AdvancedPanelProps {
  isConnected: boolean;
  onSendCommand: (hexString: string) => void;
}

export function AdvancedPanel({ isConnected, onSendCommand }: AdvancedPanelProps) {
  const [vin, setVin] = useState('');
  const [address, setAddress] = useState('');
  const [length, setLength] = useState('');
  const [writeData, setWriteData] = useState('');
  const [routineId, setRoutineId] = useState('');

  // Flashing State
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
  const [flashProgress, setFlashProgress] = useState(0);
  const [flashStatus, setFlashStatus] = useState<'idle' | 'flashing' | 'success' | 'error'>('idle');
  const [flashError, setFlashError] = useState('');

  const sendHex = (bytes: number[]) => {
    onSendCommand(bytes.map(b => b.toString(16).padStart(2, '0')).join(' '));
  };

  const handleSecurityAccess = () => {
    // Example: Request seed (Service 27 01)
    sendHex([0x27, 0x01]);
  };

  const handleModuleReset = () => {
    // Example: Hard reset (Service 11 01)
    sendHex([0x11, 0x01]);
  };

  const handleWakeUp = () => {
    // Example: Wake up bus (Tester present or specific wake up frame)
    sendHex([0x3E, 0x00]);
  };

  const handleReadMemory = () => {
    // Example: Read memory by address (Service 23)
    // In a real app, we'd parse the address and length
    sendHex([0x23, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10]);
  };

  const handleWriteVIN = () => {
    // Example: Write VIN (Service 3B or 2E depending on protocol)
    sendHex([0x3B, 0x90, 0x00]); // Placeholder
  };

  const handleDisableComm = () => sendHex([0x28, 0x03, 0x01]);
  const handleEnableComm = () => sendHex([0x28, 0x00, 0x01]);
  const handleDisableDTC = () => sendHex([0x85, 0x01, 0x02]);
  const handleEnableDTC = () => sendHex([0x85, 0x00, 0x02]);

  const handleStartRoutine = () => {
    if (!routineId) return;
    const idBytes = routineId.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
    sendHex([0x31, 0x01, ...idBytes]);
  };

  const handleStopRoutine = () => {
    if (!routineId) return;
    const idBytes = routineId.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
    sendHex([0x31, 0x02, ...idBytes]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFirmwareFile(e.target.files[0]);
      setFlashStatus('idle');
      setFlashProgress(0);
      setFlashError('');
    }
  };

  const handleStartFlash = async () => {
    if (!firmwareFile || !isConnected) return;
    
    setFlashStatus('flashing');
    setFlashProgress(0);
    setFlashError('');

    try {
      // Simulate Request Download (Service 34)
      sendHex([0x34, 0x00, 0x44, 0x00, 0x01, 0x00, 0x00]);
      await new Promise(r => setTimeout(r, 500));

      const totalBlocks = 50; 
      for (let i = 1; i <= totalBlocks; i++) {
        // Easter egg: simulate an error if the filename contains "error"
        if (firmwareFile.name.toLowerCase().includes('error') && i === 25) {
           throw new Error("Negative Response: 7F 36 72 (General Programming Failure)");
        }

        sendHex([0x36, i & 0xFF, 0xAA, 0xBB, 0xCC, 0xDD]); 
        setFlashProgress((i / totalBlocks) * 100);
        await new Promise(r => setTimeout(r, 100)); 
      }

      // Simulate Transfer Exit (Service 37)
      sendHex([0x37]);
      setFlashStatus('success');
    } catch (err: any) {
      setFlashStatus('error');
      setFlashError(err.message || 'An unknown error occurred during flashing.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-indigo-500" />
          Advanced Operations
        </h2>
        {!isConnected && (
          <span className="text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            Connect to use advanced features
          </span>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Security & Reset */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Module Control</h3>
          
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-3">
            <button
              onClick={handleSecurityAccess}
              disabled={!isConnected}
              className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center">
                <Key className="w-4 h-4 text-amber-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Request Security Access</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">27 01</span>
            </button>

            <button
              onClick={handleModuleReset}
              disabled={!isConnected}
              className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 text-red-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Hard Reset Module</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">11 01</span>
            </button>

            <button
              onClick={handleWakeUp}
              disabled={!isConnected}
              className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-yellow-500 mr-3" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Wake Up Bus</span>
              </div>
              <span className="text-xs text-zinc-500 font-mono">3E 00</span>
            </button>
          </div>
        </div>

        {/* Network Control */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Network Control</h3>
          
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDisableComm}
                disabled={!isConnected}
                className="flex items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex-col space-y-2"
              >
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white text-center">Disable Comm</span>
                <span className="text-[10px] text-zinc-500 font-mono">28 03 01</span>
              </button>
              <button
                onClick={handleEnableComm}
                disabled={!isConnected}
                className="flex items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex-col space-y-2"
              >
                <Wifi className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white text-center">Enable Comm</span>
                <span className="text-[10px] text-zinc-500 font-mono">28 00 01</span>
              </button>
              <button
                onClick={handleDisableDTC}
                disabled={!isConnected}
                className="flex items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex-col space-y-2"
              >
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white text-center">Disable DTCs</span>
                <span className="text-[10px] text-zinc-500 font-mono">85 01 02</span>
              </button>
              <button
                onClick={handleEnableDTC}
                disabled={!isConnected}
                className="flex items-center justify-center p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex-col space-y-2"
              >
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white text-center">Enable DTCs</span>
                <span className="text-[10px] text-zinc-500 font-mono">85 00 02</span>
              </button>
            </div>
          </div>
        </div>

        {/* Routine Control */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Routine Control</h3>
          
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-medium">Routine ID (Hex)</label>
              <input
                type="text"
                placeholder="e.g., FF00"
                value={routineId}
                onChange={(e) => setRoutineId(e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase())}
                disabled={!isConnected}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono placeholder-zinc-600"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStartRoutine}
                disabled={!isConnected || !routineId}
                className="flex items-center justify-center p-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-indigo-400 hover:text-indigo-300"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Start (31 01)</span>
              </button>
              <button
                onClick={handleStopRoutine}
                disabled={!isConnected || !routineId}
                className="flex items-center justify-center p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-red-400 hover:text-red-300"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Stop (31 02)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Memory & VIN */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Memory & Data</h3>
          
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-4">
            
            {/* Read Memory */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-medium">Read Memory by Address</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Address (Hex)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isConnected}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono placeholder-zinc-600"
                />
                <input
                  type="text"
                  placeholder="Len"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  disabled={!isConnected}
                  className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono placeholder-zinc-600"
                />
                <button
                  onClick={handleReadMemory}
                  disabled={!isConnected || !address}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Read
                </button>
              </div>
            </div>

            <div className="h-px bg-zinc-800 w-full my-2"></div>

            {/* Write VIN */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 font-medium">Write VIN</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="17-character VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                  disabled={!isConnected}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono placeholder-zinc-600"
                />
                <button
                  onClick={handleWriteVIN}
                  disabled={!isConnected || vin.length !== 17}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Write
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ECU Flashing */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">ECU Flashing</h3>
          
          <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <label className="block text-xs text-zinc-500 font-medium mb-2">Firmware File (.bin, .hex, .s19)</label>
                <input
                  type="file"
                  accept=".bin,.hex,.s19"
                  onChange={handleFileChange}
                  disabled={flashStatus === 'flashing'}
                  className="block w-full text-sm text-zinc-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-600/20 file:text-indigo-400
                    hover:file:bg-indigo-600/30 transition-colors
                    border border-zinc-800 rounded-lg p-1 bg-zinc-900"
                />
              </div>
              <button
                onClick={handleStartFlash}
                disabled={!isConnected || !firmwareFile || flashStatus === 'flashing'}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Start Flash
              </button>
            </div>

            {/* Progress & Status */}
            {(flashStatus !== 'idle' || firmwareFile) && (
              <div className="space-y-2 mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-300">
                    {flashStatus === 'flashing' ? 'Flashing in progress...' : 
                     flashStatus === 'success' ? 'Flash completed successfully!' : 
                     flashStatus === 'error' ? 'Flash failed.' : 
                     'Ready to flash'}
                  </span>
                  <span className="text-zinc-400">{Math.round(flashProgress)}%</span>
                </div>
                
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-200 ${
                      flashStatus === 'error' ? 'bg-red-500' : 
                      flashStatus === 'success' ? 'bg-emerald-500' : 
                      'bg-indigo-500'
                    }`}
                    style={{ width: `${flashProgress}%` }}
                  />
                </div>

                {flashStatus === 'error' && (
                  <div className="flex items-center text-xs text-red-400 mt-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {flashError}
                  </div>
                )}
                {flashStatus === 'success' && (
                  <div className="flex items-center text-xs text-emerald-400 mt-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Module successfully flashed and verified.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
