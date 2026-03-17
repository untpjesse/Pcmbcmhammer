import React from 'react';
import { X, Laptop } from 'lucide-react';
import { J2534Device } from '../lib/j2534';

interface J2534DeviceSelectorModalProps {
  isOpen: boolean;
  devices: J2534Device[];
  onSelect: (device: J2534Device) => void;
  onClose: () => void;
}

export default function J2534DeviceSelectorModal({ isOpen, devices, onSelect, onClose }: J2534DeviceSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
            <Laptop className="w-5 h-5 mr-2 text-indigo-500" />
            Select J2534 Device
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No J2534 devices found.
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => onSelect(device)}
                  className="w-full text-left p-4 rounded-lg border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-indigo-500 transition-all group"
                >
                  <h3 className="font-medium text-zinc-200 group-hover:text-indigo-400">{device.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Vendor: {device.vendor}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
