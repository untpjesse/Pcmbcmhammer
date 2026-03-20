import { useState, useEffect } from 'react';
import { Monitor, RefreshCw, X, Zap } from 'lucide-react';

interface SerialDevice {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

interface SerialDeviceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (device: SerialDevice) => void;
}

export default function SerialDeviceSelectorModal({ isOpen, onClose, onSelect }: SerialDeviceSelectorModalProps) {
  const [devices, setDevices] = useState<SerialDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanDevices = async () => {
    if (!window.electron?.serial) return;
    
    setLoading(true);
    setError(null);
    try {
      const list = await window.electron.serial.list();
      setDevices(list);
    } catch (err: any) {
      setError(err.message || 'Failed to scan for serial devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      scanDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Select Serial Device</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Scanning Hardware...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
              <p className="text-xs text-rose-400 font-medium">{error}</p>
              <button 
                onClick={scanDevices}
                className="mt-3 text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest underline underline-offset-4"
              >
                Try Again
              </button>
            </div>
          ) : devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-800">
                <Monitor className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">No Devices Found</p>
                <p className="text-[10px] text-slate-500 mt-1">Ensure your VCX Nano or interface is plugged in.</p>
              </div>
              <button 
                onClick={scanDevices}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest underline underline-offset-4"
              >
                Refresh List
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.path}
                  onClick={() => onSelect(device)}
                  className="w-full p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-blue-500/30 transition-colors">
                        <Zap className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{device.path}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                          {device.manufacturer || 'Generic Serial Device'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {device.serialNumber && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Serial Number</span>
                      <span className="text-[9px] font-mono text-slate-400">{device.serialNumber}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={scanDevices}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Refresh Device List
          </button>
        </div>
      </div>
    </div>
  );
}
