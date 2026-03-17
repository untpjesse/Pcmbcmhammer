import React, { useState } from 'react';
import { Replace, ArrowRight, CheckCircle2, AlertTriangle, Download, Upload, Trash2, RefreshCw } from 'lucide-react';

interface ModuleInitPanelProps {
  isConnected: boolean;
}

export function ModuleInitPanel({ isConnected }: ModuleInitPanelProps) {
  const [selectedModule, setSelectedModule] = useState('BCM');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backupData, setBackupData] = useState<boolean>(false);

  const modules = [
    { id: 'BCM', name: 'Body Control Module (BCM)' },
    { id: 'TCM', name: 'Transmission Control Module (TCM)' },
    { id: 'ABS', name: 'Anti-lock Braking System (ABS)' },
    { id: 'IPC', name: 'Instrument Panel Cluster (IPC)' },
  ];

  const handleProcessStep = () => {
    if (!isConnected) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      if (step === 1) {
        setBackupData(true);
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else if (step === 3) {
        setStep(4);
      } else if (step === 4) {
        alert('Programmable Module Installation (PMI) completed successfully.');
        setStep(1);
        setBackupData(false);
      }
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Replace className="w-5 h-5 mr-2 text-violet-500" />
          Programmable Module Installation (PMI)
        </h2>
      </div>

      <div className="p-4 bg-violet-500/10 border-b border-violet-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-violet-200/70">
          Use PMI when replacing a module with a new or used unit. This process copies the configuration (As-Built data) from the original module to the replacement.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Module Selection */}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Target Module for Replacement</label>
            <select
              value={selectedModule}
              onChange={(e) => { setSelectedModule(e.target.value); setStep(1); setBackupData(false); }}
              disabled={!isConnected || step > 1}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 px-4 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 disabled:opacity-50"
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* PMI Workflow Steps */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-zinc-800 z-0"></div>

            <div className="space-y-6 relative z-10">
              {/* Step 1 */}
              <div className={`flex items-start transition-opacity ${step < 1 ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  step > 1 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                  step === 1 ? 'bg-violet-500/20 border-violet-500 text-violet-400' :
                  'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}>
                  {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                </div>
                <div className="ml-6 flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-medium text-zinc-200">1. Read Original Module</h3>
                  <p className="text-sm text-zinc-500 mt-1 mb-4">Connect to the original {selectedModule} to extract its configuration data.</p>
                  {step === 1 && (
                    <button
                      onClick={handleProcessStep}
                      disabled={!isConnected || isProcessing}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 'Read Data'}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className={`flex items-start transition-opacity ${step < 2 ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  step > 2 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                  step === 2 ? 'bg-violet-500/20 border-violet-500 text-violet-400' :
                  'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}>
                  {step > 2 ? <CheckCircle2 className="w-6 h-6" /> : <Replace className="w-6 h-6" />}
                </div>
                <div className="ml-6 flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-medium text-zinc-200">2. Install Replacement Module</h3>
                  <p className="text-sm text-zinc-500 mt-1 mb-4">Turn ignition OFF. Physically remove the original {selectedModule} and install the replacement. Turn ignition ON (Engine OFF).</p>
                  {step === 2 && (
                    <button
                      onClick={handleProcessStep}
                      disabled={!isConnected || isProcessing}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 'Confirm Module Installed'}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className={`flex items-start transition-opacity ${step < 3 ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  step > 3 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                  step === 3 ? 'bg-violet-500/20 border-violet-500 text-violet-400' :
                  'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}>
                  {step > 3 ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="ml-6 flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-medium text-zinc-200">3. Write Configuration Data</h3>
                  <p className="text-sm text-zinc-500 mt-1 mb-4">Restore the previously extracted configuration to the new {selectedModule}.</p>
                  {step === 3 && (
                    <button
                      onClick={handleProcessStep}
                      disabled={!isConnected || isProcessing}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 'Write Data'}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 4 */}
              <div className={`flex items-start transition-opacity ${step < 4 ? 'opacity-40' : 'opacity-100'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  step > 4 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                  step === 4 ? 'bg-violet-500/20 border-violet-500 text-violet-400' :
                  'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}>
                  {step > 4 ? <CheckCircle2 className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
                </div>
                <div className="ml-6 flex-1 bg-zinc-950/50 border border-zinc-800 rounded-xl p-5">
                  <h3 className="text-base font-medium text-zinc-200">4. Clear DTCs & Finalize</h3>
                  <p className="text-sm text-zinc-500 mt-1 mb-4">Clear any communication codes set during the replacement process and reboot the module.</p>
                  {step === 4 && (
                    <button
                      onClick={handleProcessStep}
                      disabled={!isConnected || isProcessing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 'Clear Codes & Finish'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
