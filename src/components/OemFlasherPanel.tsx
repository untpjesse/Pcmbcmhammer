import React, { useState } from 'react';
import { FileArchive, UploadCloud, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';

interface OemFlasherPanelProps {
  isConnected: boolean;
}

export function OemFlasherPanel({ isConnected }: OemFlasherPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetModule, setTargetModule] = useState('PCM');
  const [flashProgress, setFlashProgress] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashStatus, setFlashStatus] = useState<'idle' | 'flashing' | 'success' | 'error'>('idle');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFlashStatus('idle');
      setFlashProgress(0);
    }
  };

  const handleFlash = () => {
    if (!isConnected || !selectedFile) return;
    
    setIsFlashing(true);
    setFlashStatus('flashing');
    setFlashProgress(0);

    // In a real implementation, this would use the J2534 API to flash the file
    setFlashStatus('error');
    setFlashProgress(0);
    setIsFlashing(false);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <FileArchive className="w-5 h-5 mr-2 text-sky-500" />
          OEM Calibration Flasher (J2534)
        </h2>
      </div>

      <div className="p-4 bg-sky-500/10 border-b border-sky-500/20 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-sky-200/70">
          Flash factory calibration files (.vbf, .sgo, .frf, .bin) directly to modules. Ensure a battery maintainer is connected before initiating a flash sequence.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* File Selection */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">1. Select Calibration File</h3>
            
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                selectedFile ? 'border-sky-500/50 bg-sky-500/5' : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-600'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {selectedFile ? (
                    <>
                      <FileCode className="w-8 h-8 text-sky-500 mb-2" />
                      <p className="text-sm font-medium text-zinc-200">{selectedFile.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
                      <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-sky-500">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-zinc-500">.vbf, .sgo, .frf, .bin (MAX. 10MB)</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".vbf,.sgo,.frf,.bin" onChange={handleFileSelect} disabled={isFlashing} />
              </label>
            </div>
          </div>

          {/* Target Module */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">2. Select Target Module</h3>
            <select
              value={targetModule}
              onChange={(e) => setTargetModule(e.target.value)}
              disabled={!isConnected || isFlashing}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-4 text-sm text-zinc-200 focus:outline-none focus:border-sky-500 disabled:opacity-50"
            >
              <option value="PCM">Powertrain Control Module (PCM)</option>
              <option value="TCM">Transmission Control Module (TCM)</option>
              <option value="BCM">Body Control Module (BCM)</option>
              <option value="ABS">Anti-lock Braking System (ABS)</option>
            </select>
          </div>

          {/* Flash Action */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">3. Execute Flash</h3>
            
            <button
              onClick={handleFlash}
              disabled={!isConnected || !selectedFile || isFlashing || flashStatus === 'success'}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center mb-6"
            >
              {isFlashing ? 'Flashing in progress...' : flashStatus === 'success' ? 'Flash Complete' : 'Start Flashing Sequence'}
            </button>

            {/* Progress Bar */}
            {(isFlashing || flashStatus === 'success') && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className={flashStatus === 'success' ? 'text-emerald-400' : 'text-sky-400'}>
                    {flashStatus === 'success' ? 'Verification Successful' : 'Writing blocks...'}
                  </span>
                  <span className="text-zinc-300">{Math.min(100, Math.round(flashProgress))}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${flashStatus === 'success' ? 'bg-emerald-500' : 'bg-sky-500'}`}
                    style={{ width: `${Math.min(100, flashProgress)}%` }}
                  ></div>
                </div>
                {flashStatus === 'error' && (
                  <div className="flex items-center justify-center text-red-400 text-sm mt-4 pt-4 border-t border-zinc-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    OEM Flashing requires official backend integration.
                  </div>
                )}
                {flashStatus === 'success' && (
                  <div className="flex items-center justify-center text-emerald-400 text-sm mt-4 pt-4 border-t border-zinc-800">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Module successfully updated
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
