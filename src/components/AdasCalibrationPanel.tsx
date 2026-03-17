import React, { useState } from 'react';
import { Target, Crosshair, AlertTriangle, CheckCircle2, RefreshCw, Car } from 'lucide-react';

interface AdasCalibrationPanelProps {
  isConnected: boolean;
}

export function AdasCalibrationPanel({ isConnected }: AdasCalibrationPanelProps) {
  const [selectedSystem, setSelectedSystem] = useState('front_camera');
  const [calibrationState, setCalibrationState] = useState<'idle' | 'preparing' | 'calibrating' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const systems = [
    { id: 'front_camera', name: 'Front Camera (LDW/LKA)', desc: 'Lane Departure Warning / Lane Keep Assist camera calibration.' },
    { id: 'front_radar', name: 'Front Radar (ACC/FCA)', desc: 'Adaptive Cruise Control / Forward Collision Assist radar calibration.' },
    { id: 'blind_spot', name: 'Blind Spot Radar (BSD)', desc: 'Rear corner radar calibration for Blind Spot Detection.' },
    { id: 'surround_view', name: 'Surround View Camera (AVM)', desc: '360-degree Around View Monitor camera stitching and calibration.' }
  ];

  const handleStartCalibration = () => {
    if (!isConnected) return;
    setCalibrationState('preparing');
    setProgress(0);

    setTimeout(() => {
      setCalibrationState('calibrating');
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCalibrationState('success');
            return 100;
          }
          return prev + (Math.random() * 10);
        });
      }, 500);
    }, 2000);
  };

  const activeSystem = systems.find(s => s.id === selectedSystem);

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Target className="w-5 h-5 mr-2 text-teal-500" />
          ADAS Calibration
        </h2>
      </div>

      <div className="p-4 bg-teal-500/10 border-b border-teal-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-teal-200/70">
          Advanced Driver Assistance Systems (ADAS) calibration requires specific physical targets, level ground, and exact measurements. Ensure the environment meets OEM specifications before proceeding.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Select ADAS System</h3>
              <div className="space-y-2">
                {systems.map(sys => (
                  <button
                    key={sys.id}
                    onClick={() => { setSelectedSystem(sys.id); setCalibrationState('idle'); setProgress(0); }}
                    disabled={calibrationState === 'calibrating' || calibrationState === 'preparing'}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedSystem === sys.id 
                        ? 'bg-teal-500/10 border-teal-500/50 text-teal-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700'
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium">{sys.name}</div>
                    <div className="text-xs mt-1 opacity-70">{sys.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-6 flex flex-col">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Calibration Status</h3>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/50 mb-6 relative overflow-hidden">
                {calibrationState === 'idle' && (
                  <>
                    <Crosshair className="w-12 h-12 text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-400">Ready to calibrate {activeSystem?.name}.</p>
                    <p className="text-xs text-zinc-500 mt-2">Place targets according to OEM service manual.</p>
                  </>
                )}
                {calibrationState === 'preparing' && (
                  <>
                    <RefreshCw className="w-12 h-12 text-teal-500 mb-3 animate-spin" />
                    <p className="text-sm text-teal-400">Communicating with module...</p>
                    <p className="text-xs text-zinc-500 mt-2">Checking preconditions</p>
                  </>
                )}
                {calibrationState === 'calibrating' && (
                  <>
                    <Target className="w-12 h-12 text-teal-500 mb-3 animate-pulse" />
                    <p className="text-sm text-teal-400">Calibrating...</p>
                    <div className="w-full max-w-xs mt-4">
                      <div className="flex justify-between text-xs mb-1 text-zinc-400">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div className="bg-teal-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
                {calibrationState === 'success' && (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                    <p className="text-sm text-emerald-400 font-medium">Calibration Successful</p>
                    <p className="text-xs text-zinc-500 mt-2">The system is ready for use.</p>
                  </>
                )}
              </div>

              <button
                onClick={handleStartCalibration}
                disabled={!isConnected || calibrationState === 'calibrating' || calibrationState === 'preparing'}
                className={`w-full py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                  calibrationState === 'success' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' :
                  'bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500'
                }`}
              >
                {calibrationState === 'success' ? 'Start New Calibration' : 
                 calibrationState === 'calibrating' ? 'Calibrating...' : 
                 'Initiate Calibration Sequence'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
