import React, { useState, useEffect } from 'react';
import { Target, AlertCircle, RefreshCw, CheckCircle2, Compass, MoveHorizontal } from 'lucide-react';

interface SasPanelProps {
  isConnected: boolean;
}

export function SasPanel({ isConnected }: SasPanelProps) {
  const [angle, setAngle] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  useEffect(() => {
    if (isConnected && !isCalibrating) {
      const interval = setInterval(() => {
        setAngle(prev => {
          const change = (Math.random() - 0.5) * 2;
          return Math.max(-450, Math.min(450, prev + change));
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isConnected, isCalibrating]);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setCalibrated(false);
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrated(true);
      setAngle(0);
    }, 5000);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="hardware-card p-4 bg-slate-900/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Steering Angle Sensor</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">SAS Calibration & Zero-Point</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hardware-card p-8 bg-slate-900/30 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30" />
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div 
                className="absolute w-full h-full border-4 border-slate-800 rounded-full transition-transform duration-100"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-blue-500" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-1 bg-slate-700" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-1 bg-slate-700" />
              </div>
              <div className="flex flex-col items-center z-10">
                <span className="text-4xl font-bold text-white font-mono tracking-tighter">
                  {angle.toFixed(1)}°
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Angle</span>
              </div>
            </div>
            <div className="flex space-x-8">
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Status</p>
                <p className={`text-[10px] font-bold uppercase ${calibrated ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {calibrated ? 'Calibrated' : 'Needs Zero-Point'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Center</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase">
                  {Math.abs(angle) < 2 ? 'Centered' : 'Off-Center'}
                </p>
              </div>
            </div>
          </div>

          <div className="hardware-card p-6 bg-slate-900/30 space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calibration Procedure</h3>
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                To perform a zero-point calibration, ensure the steering wheel is in the <span className="text-white font-bold">dead-center</span> position and the vehicle is stationary.
              </p>
              <button
                disabled={!isConnected || isCalibrating}
                onClick={handleCalibrate}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center shadow-lg shadow-blue-500/10"
              >
                {isCalibrating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Compass className="w-4 h-4 mr-2" />}
                Calibrate Zero Point
              </button>
              
              {isCalibrating && (
                <div className="space-y-2">
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-progress" style={{ width: '100%' }} />
                  </div>
                  <p className="text-[9px] text-blue-400 font-bold uppercase text-center animate-pulse">Writing Calibration Data to EEPROM...</p>
                </div>
              )}

              {calibrated && !isCalibrating && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Calibration Successful</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300/80 leading-relaxed italic uppercase tracking-wider">
              Interface connection required for SAS calibration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
